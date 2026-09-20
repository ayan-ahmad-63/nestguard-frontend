"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { AlertItem } from "@/types";
import { INITIAL_VISITORS } from "@/data/mock";

const INITIAL_GLOBAL_ALERTS: AlertItem[] = [
  {
    id: 1,
    sev: "critical",
    time: "09:27:55",
    title: "Unauthorized access attempt",
    detail: "Unknown fingerprint scanned 3 consecutive times at Service Entry. No biometric hash match in database.",
    gate: "Service Entry",
    user: "Unknown Person",
    acknowledged: false,
  },
  {
    id: 2,
    sev: "attention",
    time: "09:22:10",
    title: "Door held open >30 seconds",
    detail: "Block A main entrance magnetic latch remained unengaged for 47 seconds after valid scan. Tailgating risk.",
    gate: "Block A",
    user: "Priya Kapoor",
    acknowledged: false,
  },
  {
    id: 3,
    sev: "attention",
    time: "08:55:01",
    title: "Reader offline — Block C",
    detail: "Block C primary optical reader failed heartbeat telemetry check. Last ping recorded at 08:54:18.",
    gate: "Block C",
    user: "System Daemon",
    acknowledged: false,
  },
];

type AppContextType = {
  authed: boolean;
  setAuthed: (v: boolean) => void;
  alerts: AlertItem[];
  setAlerts: (alerts: AlertItem[]) => void;
  unreadAlertCount: number;
  pendingVisitorCount: number;
  setPendingVisitorCount: (n: number) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_GLOBAL_ALERTS);
  const [pendingVisitorCount, setPendingVisitorCount] = useState(
    INITIAL_VISITORS.filter((v) => v.status === "pending").length
  );

  const unreadAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <AppContext.Provider value={{ authed, setAuthed, alerts, setAlerts, unreadAlertCount, pendingVisitorCount, setPendingVisitorCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
