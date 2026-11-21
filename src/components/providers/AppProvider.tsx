"use client";
import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { AlertItem, AccessLog } from "@/types";
import type { Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || API_URL;

const INITIAL_GLOBAL_ALERTS: AlertItem[] = [];

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

type AppContextType = {
  authed: boolean;
  setAuthed: (v: boolean) => void;
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  alerts: AlertItem[];
  setAlerts: React.Dispatch<React.SetStateAction<AlertItem[]>>;
  unreadAlertCount: number;
  pendingVisitorCount: number;
  setPendingVisitorCount: React.Dispatch<React.SetStateAction<number>>;
  liveLogs: AccessLog[];
  setLiveLogs: React.Dispatch<React.SetStateAction<AccessLog[]>>;
  wsConnected: boolean;
  apiUrl: string;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_GLOBAL_ALERTS);
  const [liveLogs, setLiveLogs] = useState<AccessLog[]>([]);
  const [pendingVisitorCount, setPendingVisitorCount] = useState<number>(0);
  const [wsConnected, setWsConnected] = useState(false);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ng_token");
        localStorage.removeItem("ng_session");
        localStorage.removeItem("ng_role");
        localStorage.removeItem("ng_user");
        localStorage.removeItem("ng_last_route");
        sessionStorage.clear();
        document.cookie = "ng_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "ng_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "ng_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "ng_last_route=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch { }

      try {
        fetch(`${API_URL}/api/v1/auth/logout`, { method: "POST", credentials: "include" }).catch(() => { });
      } catch { }

      // Hard replace directly to /login without resetting user state in-place (prevents UI flicker to default role)
      window.location.replace("/login?logout=true");
    }
  }, []);

  // ── SERVER RESTART DETECTION (Requires re-login when server restarts) ──
  const handleServerBootCheck = useCallback((serverBootTime: number) => {
    if (typeof window === "undefined") return;
    const previousBoot = localStorage.getItem("ng_server_boot");

    // If we had a previous session and the server boot time changed -> Server restarted!
    if (previousBoot && Number(previousBoot) !== serverBootTime) {
      console.warn("[NestGuard] Backend server restart detected! Requiring fresh authentication.");
      localStorage.removeItem("ng_token");
      localStorage.removeItem("ng_session");
      localStorage.removeItem("ng_role");
      localStorage.removeItem("ng_user");
      localStorage.setItem("ng_server_boot", String(serverBootTime));
      document.cookie = "ng_token=; path=/; max-age=0";
      document.cookie = "ng_session=; path=/; max-age=0";
      document.cookie = "ng_role=; path=/; max-age=0";
      setAuthed(false);
      setUser(null);
      window.location.replace("/login?serverRestarted=true");
      return;
    }

    // Store current boot time
    localStorage.setItem("ng_server_boot", String(serverBootTime));
  }, []);

  // Restore authed state and user profile on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("ng_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch { }
      }

      const tokenInStorage = localStorage.getItem("ng_token");
      const tokenMatch = document.cookie.match(/ng_token=([^;]+)/);
      const tokenInCookie = tokenMatch ? tokenMatch[1].trim() : null;
      const hasSession = document.cookie.includes("ng_session=true");

      const hasValidAuth = Boolean(
        hasSession ||
        (tokenInStorage && tokenInStorage.length > 10) ||
        (tokenInCookie && tokenInCookie.length > 10)
      );

      setAuthed(hasValidAuth);
    }
  }, []);

  // Check health and server boot time once on mount (live restarts handled via Socket.IO server_boot event)
  useEffect(() => {
    const checkServerBoot = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/health-check`, { cache: "no-store" });
        const json = await res.json();
        const bootTime = json.data?.serverBootTime;
        if (bootTime) {
          handleServerBootCheck(bootTime);
        }
      } catch { }
    };

    checkServerBoot();
  }, [handleServerBootCheck]);

  // ── FETCH PERSISTED ACCESS LOGS & ALERTS FROM MONGODB (Never fresh-start on reload) ──
  useEffect(() => {
    if (!authed) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("ng_token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // 1. Fetch persisted logs
    fetch(`${API_URL}/api/v1/entry-logs?limit=50`, {
      headers,
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        const list = json.data || json.data?.logs || [];
        if (Array.isArray(list) && list.length > 0) {
          setLiveLogs(list);
        }
      })
      .catch(() => { });

    // 2. Fetch persisted alerts
    fetch(`${API_URL}/api/v1/alerts?limit=50`, {
      headers,
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        const list = json.data || json.data?.alerts || [];
        if (Array.isArray(list) && list.length > 0) {
          setAlerts(list);
        }
      })
      .catch(() => { });
  }, [authed]);

  const unreadAlertCount = alerts.filter((a) => !a.acknowledged).length;

  // ── Socket.IO connection ──────────────────────
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!authed) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setWsConnected(false);
      }
      return;
    }

    import("socket.io-client").then(({ io }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("ng_token") : null;
      const socket = io(WS_URL, {
        auth: token ? { token } : {},
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setWsConnected(true);
      });

      socket.on("server_boot", (payload: { serverBootTime: number }) => {
        if (payload?.serverBootTime) {
          handleServerBootCheck(payload.serverBootTime);
        }
      });

      socket.on("disconnect", () => {
        setWsConnected(false);
      });

      socket.on("connect_error", () => {
        setWsConnected(false);
      });

      // Live access log event
      socket.on("scan_event", (payload: { log: AccessLog }) => {
        if (!payload?.log) return;
        setLiveLogs((prev) => [payload.log, ...prev].slice(0, 100));
      });

      // New alert event
      socket.on("alert_event", (payload: { alert: AlertItem }) => {
        if (!payload?.alert) return;
        setAlerts((prev) => [payload.alert, ...prev]);
      });
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setWsConnected(false);
    };
  }, [authed, handleServerBootCheck]);

  const contextValue = useMemo(
    () => ({
      authed,
      setAuthed,
      user,
      setUser,
      alerts,
      setAlerts,
      unreadAlertCount,
      pendingVisitorCount,
      setPendingVisitorCount,
      liveLogs,
      setLiveLogs,
      wsConnected,
      apiUrl: API_URL,
      logout,
    }),
    [
      authed,
      user,
      alerts,
      unreadAlertCount,
      pendingVisitorCount,
      liveLogs,
      wsConnected,
      logout,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
