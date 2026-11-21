import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { io, type Socket } from "socket.io-client";
import FloatingThemeToggle from "../components/ui/FloatingThemeToggle";
import Modal from "../components/ui/Modal";
import { useAppContext } from "../components/providers/AppProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";
const SIMULATE = process.env.NEXT_PUBLIC_ENABLE_SIMULATE === "true"; // dev only; the API must also allow it

interface Props {
  onLogin: () => void;
  onBack?: () => void;
}

export default function Login({ onLogin, onBack }: Props) {
  const { setUser } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"warden" | "admin" | "security">("warden");
  const [scanningRole, setScanningRole] = useState<"warden" | "admin" | "security" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live20R Physical Thumb Scan State
  const [thumbModalOpen, setThumbModalOpen] = useState(false);
  const [waitingThumb, setWaitingThumb] = useState(false);
  const [thumbSuccess, setThumbSuccess] = useState<string | null>(null);
  const [thumbError, setThumbError] = useState<string | null>(null);
  const thumbPollRef = useRef<NodeJS.Timeout | null>(null);
  const thumbSocketRef = useRef<Socket | null>(null);
  const thumbNonceRef = useRef<string | null>(null); // one-time session id for this thumb login

  const [staffFps, setStaffFps] = useState<Record<string, string>>({
    admin: "FP-ADM-05",
    warden: "FP-WRD-03",
    security: "FP-SEC-05",
  });

  const fetchStaffFps = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/staff-profiles`, { cache: "no-store" });
      const data = await res.json();
      if (data.data?.staff && Array.isArray(data.data.staff)) {
        const map: Record<string, string> = {};
        for (const s of data.data.staff) {
          if (s.role && s.fingerprintId) {
            map[s.role.toLowerCase()] = s.fingerprintId;
          }
        }
        setStaffFps((prev) => ({ ...prev, ...map }));
      }
    } catch {}
  }, []);

  const getStaffFp = (role?: string | null) => {
    if (!role) return "FP-001";
    const r = role.toLowerCase();
    return staffFps[r] || (r === "admin" ? "FP-ADM-05" : r === "security" ? "FP-SEC-05" : "FP-WRD-03");
  };

  useEffect(() => {
    fetchStaffFps();
    try {
      const socket = io(WS_URL, { transports: ["websocket", "polling"] });
      socket.on("biometric_fp_updated", () => {
        fetchStaffFps();
      });
      return () => {
        socket.disconnect();
      };
    } catch {}
  }, [fetchStaffFps]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      if (search.includes("serverRestarted=true")) {
        setError("⚠️ Security Notice: Backend server restarted. Please log in to authenticate your new session.");
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (thumbPollRef.current) clearInterval(thumbPollRef.current);
      if (thumbSocketRef.current) thumbSocketRef.current.disconnect();
    };
  }, []);

  // If redirected with logout flag, ensure all residual state and storage are cleaned
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("logout") === "true") {
        document.cookie = "ng_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "ng_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "ng_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        try {
          localStorage.removeItem("ng_token");
          localStorage.removeItem("ng_user");
          sessionStorage.clear();
        } catch { }
        setUser(null);
      }
    }
  }, [setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Invalid credentials");
        return;
      }
      // Store token for Socket.IO auth and proxy RBAC
      if (json.data?.token) {
        localStorage.setItem("ng_token", json.data.token);
        document.cookie = `ng_token=${json.data.token}; path=/; max-age=86400; SameSite=Lax`;
      }
      if (json.data?.user) {
        localStorage.setItem("ng_user", JSON.stringify(json.data.user));
        setUser(json.data.user);
      } else {
        throw new Error("Malformed login response");
      }
      // Set role cookie for proxy route guarding
      const activeRole = String(json.data.user.role).toLowerCase();
      document.cookie = `ng_role=${activeRole}; path=/; max-age=86400; SameSite=Lax`;

      // Session cookie for optimistic auth
      document.cookie = "ng_session=true; path=/; max-age=86400; SameSite=Lax";
      onLogin();
    } catch {
      setError("Cannot reach the NestGuard server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Clean up polling timer on unmount
  useEffect(() => {
    return () => {
      if (thumbPollRef.current) clearInterval(thumbPollRef.current);
    };
  }, []);

  const handleThumbLoginSuccess = useCallback((r: any) => {
    if (thumbPollRef.current) {
      clearInterval(thumbPollRef.current);
      thumbPollRef.current = null;
    }
    if (thumbSocketRef.current) {
      thumbSocketRef.current.disconnect();
      thumbSocketRef.current = null;
    }
    setWaitingThumb(false);
    const matchedRole = r.user.role.toLowerCase();
    setThumbSuccess(`✓ Fingerprint matched! Authenticated as ${r.user.name} (${r.user.role.toUpperCase()})`);

    if (r.token) {
      localStorage.setItem("ng_token", r.token);
      document.cookie = `ng_token=${r.token}; path=/; max-age=86400; SameSite=Lax`;
    }

    const authenticatedUser = {
      id: r.user.id || `staff-${matchedRole}`,
      email: r.user.email || `${matchedRole}@nestguard.in`,
      role: matchedRole,
      name: r.user.name || (matchedRole.charAt(0).toUpperCase() + matchedRole.slice(1)),
      fingerprintId: r.user.fingerprintId || getStaffFp(matchedRole),
    };

    localStorage.setItem("ng_user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    document.cookie = `ng_role=${authenticatedUser.role}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = "ng_session=true; path=/; max-age=86400; SameSite=Lax";

    setTimeout(() => {
      setThumbModalOpen(false);
      onLogin();
    }, 1200);
  }, [getStaffFp, onLogin, setUser]);

  const handleBiometricScan = async (targetRole?: "warden" | "admin" | "security") => {
    setScanningRole(targetRole || null);
    setThumbModalOpen(true);
    setWaitingThumb(true);
    setThumbSuccess(null);
    setThumbError(null);

    try {
      // 1. Arm backend for physical thumb touch on Live20R (role is null for ANY matching staff!)
      const armRes = await fetch(`${API_URL}/api/v1/hardware/zkteco/arm-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole || null }),
      });
      const armJson = await armRes.json();
      thumbNonceRef.current = armJson.data?.nonce ?? null;
      if (!armRes.ok || !thumbNonceRef.current) throw new Error(armJson.message || "arm failed");

      // 2. Poll with the one-time session nonce: the token is only ever handed to this browser
      if (thumbPollRef.current) clearInterval(thumbPollRef.current);
      thumbPollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/v1/hardware/zkteco/login-status?nonce=${encodeURIComponent(thumbNonceRef.current || "")}`, { cache: "no-store" });
          const json = await res.json();
          if (json.data?.lastResult) {
            const r = json.data.lastResult;
            if (r.success && r.user) {
              handleThumbLoginSuccess(r);
            } else if (r.error) {
              setThumbError(r.error);
            }
          }
        } catch {}
      }, 1000);
    } catch {
      setThumbError("Failed to arm Live20R gateway. Please check that backend is running.");
    }
  };

  const closeThumbModal = async () => {
    if (thumbPollRef.current) {
      clearInterval(thumbPollRef.current);
      thumbPollRef.current = null;
    }
    if (thumbSocketRef.current) {
      thumbSocketRef.current.disconnect();
      thumbSocketRef.current = null;
    }
    try {
      await fetch(`${API_URL}/api/v1/hardware/zkteco/disarm-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce: thumbNonceRef.current }),
      });
      thumbNonceRef.current = null;
    } catch {}
    setThumbModalOpen(false);
    setWaitingThumb(false);
    setThumbSuccess(null);
    setThumbError(null);
  };

  const simulateHardwareThumbTouch = async (roleOverride?: string) => {
    if (!SIMULATE) return;
    const roleToScan = roleOverride || scanningRole || "warden";
    const fpId = getStaffFp(roleToScan);
    try {
      await fetch(`${API_URL}/api/v1/hardware/zkteco/simulate-touch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleToScan, fingerprintId: fpId }),
      });
    } catch {
      setThumbError("Simulation endpoint unreachable.");
    }
  };

  const fillDemo = (role: "warden" | "admin" | "security") => {
    setSelectedRole(role);
    if (role === "warden") {
      setEmail("warden@nestguard.in");
      setPassword("Warden@1234");
    } else if (role === "admin") {
      setEmail("admin@nestguard.in");
      setPassword("Admin@1234");
    } else {
      setEmail("security@nestguard.in");
      setPassword("Security@1234");
    }
    setError(null);
  };

    return (
      <div className="min-h-screen flex items-center justify-center p-5 select-none relative overflow-hidden bg-ng-bg text-ng-text font-body">
        {/* ── Massive Ambient Orbs ──────────────────────── */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[100vw] h-[800px] rounded-full pointer-events-none opacity-20 blur-[140px] z-0"
          style={{ background: "radial-gradient(ellipse at center, var(--color-ng-orange), transparent 70%)" }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[80vw] h-[600px] rounded-full pointer-events-none opacity-20 blur-[120px] z-0"
          style={{ background: "radial-gradient(ellipse at center, var(--color-ng-blue), transparent 70%)" }} />



        {onBack && (
          <button
            onClick={onBack}
            className="fixed top-6 left-6 flex items-center gap-1.5 text-xs font-medium cursor-pointer bg-transparent transition-colors z-20 text-ng-secondary hover:text-ng-text border-none"
          >
            ← Back to site
          </button>
        )}

        <FloatingThemeToggle className="fixed bottom-6 right-6 z-50 hover:scale-105 transition-transform" />

        <div className="w-full max-w-md rounded-3xl border border-ng-border bg-ng-panel/80 backdrop-blur-2xl p-8 sm:p-10 relative z-10 shadow-2xl overflow-hidden">
          {/* Ambient Top Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none blur-[60px] opacity-20 bg-ng-orange" />

          {/* Brand */}
          <div className="flex flex-col items-center gap-4 mb-10 text-center relative z-10">
            <Image src="/logo-stacked.png" alt="NestGuard" width={586} height={373} className="h-[160px] w-auto object-contain shrink-0" priority />
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-ng-secondary mb-1.5">
                Access Control Console
              </div>
              <div className="text-[10px] font-mono text-ng-muted">
                Hardware-authenticated operations portal
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl text-xs font-mono border border-red-500/30 bg-red-500/10 text-red-500 text-center relative z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest mb-2 text-ng-muted">
                Operator Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="warden@nestguard.in"
                onFocus={() => setFocus("email")}
                onBlur={() => setFocus(null)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors bg-ng-elevated text-ng-text placeholder-ng-muted"
                style={{
                  borderColor: focus === "email" ? "var(--color-ng-orange)" : "var(--color-ng-border)",
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-ng-muted">
                  Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-mono cursor-pointer bg-transparent border-none text-ng-secondary hover:text-ng-text transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  onFocus={() => setFocus("password")}
                  onBlur={() => setFocus(null)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors bg-ng-elevated text-ng-text placeholder-ng-muted"
                  style={{
                    borderColor: focus === "password" ? "var(--color-ng-orange)" : "var(--color-ng-border)",
                  }}
                />
              </div>
            </div>

            {/* Quick Credential Pre-fill Badges */}
            <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
              <span className="text-ng-muted font-mono">Demo presets:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemo("warden")}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono cursor-pointer transition-colors ${
                    selectedRole === "warden"
                      ? "border-ng-orange bg-ng-orange/20 text-ng-orange font-bold"
                      : "border-ng-border bg-ng-elevated text-ng-secondary hover:text-ng-orange hover:border-ng-orange/50"
                  }`}
                >
                  Warden
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("admin")}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono cursor-pointer transition-colors ${
                    selectedRole === "admin"
                      ? "border-ng-orange bg-ng-orange/20 text-ng-orange font-bold"
                      : "border-ng-border bg-ng-elevated text-ng-secondary hover:text-ng-orange hover:border-ng-orange/50"
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("security")}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono cursor-pointer transition-colors ${
                    selectedRole === "security"
                      ? "border-ng-orange bg-ng-orange/20 text-ng-orange font-bold"
                      : "border-ng-border bg-ng-elevated text-ng-secondary hover:text-ng-orange hover:border-ng-orange/50"
                  }`}
                >
                  Security
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl font-display font-semibold text-sm text-white border-none cursor-pointer transition-all duration-300 bg-ng-orange hover:brightness-110 shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:shadow-[0_0_30px_rgba(255,107,0,0.4)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating…" : "Authenticate & Launch Console"}
            </button>

            {/* Biometric Hardware Scan Section */}
            <div className="relative flex items-center justify-center my-2">
              <span className="w-full border-b border-ng-border" />
              <span className="absolute px-3 text-[10px] font-mono uppercase tracking-widest bg-transparent text-ng-muted" style={{ background: "var(--ng-panel)" }}>
                Or Biometric Hardware Scan
              </span>
            </div>

            {/* Role-Aware Biometric Trigger */}
            <button
              type="button"
              onClick={() => handleBiometricScan()}
              disabled={loading}
              className="w-full py-3 rounded-xl font-display font-medium text-sm border cursor-pointer transition-all flex items-center justify-center gap-2 bg-ng-elevated border-ng-border text-ng-text hover:bg-white/[0.04]"
            >
              <span>👆</span>
              <span>Scan Fingerprint to Login (Any Staff)</span>
            </button>


          </form>

          <p className="font-mono text-[10px] text-center mt-8 leading-relaxed text-ng-muted relative z-10">
            NestGuard v2.4.1 · Multi-Tenant Security Gateway
            <br />
            Authorised staff only. Access attempts are cryptographically signed.
          </p>
        </div>

        {/* Live20R Optical Thumb Scanner Modal */}
        <Modal
          isOpen={thumbModalOpen}
          onClose={closeThumbModal}
          title="ZKTeco Live20R Biometric Login"
          subtitle="Place ANY enrolled staff finger (Admin · Warden · Security) on scanner glass"
          maxWidth="460px"
        >
          <div className="flex flex-col items-center gap-5 text-center font-body py-2">
            {/* Circular Optical Sensor Scanner Graphic */}
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center border-2 border-ng-border bg-ng-elevated/70 shadow-2xl overflow-hidden">
              {/* Glowing Sensor Prism */}
              <div
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
                  thumbSuccess
                    ? "bg-green-500/20 border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                    : thumbError
                    ? "bg-red-500/20 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                    : "bg-ng-orange/15 border-2 border-ng-orange shadow-[0_0_30px_rgba(255,107,0,0.3)] animate-pulse"
                }`}
              >
                <span className="text-4xl select-none">
                  {thumbSuccess ? "✓" : "👆"}
                </span>
              </div>

              {/* Laser Scanning Line Animation */}
              {waitingThumb && (
                <div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ng-orange to-transparent animate-pulse"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-ng-text font-display m-0">
                {thumbSuccess
                  ? "Staff Biometric Verified!"
                  : waitingThumb
                  ? "Place ANY Enrolled Staff Finger on Reader"
                  : "Scanner Idle"}
              </h4>
              <p className="text-xs font-mono text-ng-secondary m-0">
                Universal 1:N Biometric Matching:{" "}
                <strong className="text-ng-orange">
                  {scanningRole ? scanningRole.toUpperCase() : "Admin · Warden · Security"}
                </strong>
              </p>
            </div>

            {/* Status / Error Toast */}
            {thumbSuccess ? (
              <div className="w-full p-3 rounded-xl border border-green-500/30 bg-green-500/15 text-green-400 font-mono text-xs animate-fade-in">
                {thumbSuccess}
              </div>
            ) : thumbError ? (
              <div className="w-full p-3 rounded-xl border border-red-500/30 bg-red-500/15 text-red-400 font-mono text-xs">
                {thumbError}
              </div>
            ) : (
              <div className="w-full p-3 rounded-xl border border-ng-border bg-ng-elevated text-ng-muted font-mono text-xs flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Awaiting physical thumb contact on scanner glass…</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="w-full flex flex-col gap-2 pt-2 border-t border-ng-border">
              <span className={`text-[10px] font-mono uppercase tracking-wider text-ng-muted ${SIMULATE ? "" : "hidden"}`}>
                Simulate Touch Without USB Cable:
              </span>
              <div className={`grid grid-cols-3 gap-2 ${SIMULATE ? "" : "hidden"}`}>
                <button
                  type="button"
                  onClick={() => simulateHardwareThumbTouch("warden")}
                  className="px-2 py-1.5 rounded-lg border border-ng-border bg-ng-elevated text-[11px] font-mono text-ng-secondary hover:text-green-400 hover:border-green-500/40 cursor-pointer transition-colors"
                >
                  Warden ({getStaffFp("warden")})
                </button>
                <button
                  type="button"
                  onClick={() => simulateHardwareThumbTouch("admin")}
                  className="px-2 py-1.5 rounded-lg border border-ng-border bg-ng-elevated text-[11px] font-mono text-ng-secondary hover:text-green-400 hover:border-green-500/40 cursor-pointer transition-colors"
                >
                  Admin ({getStaffFp("admin")})
                </button>
                <button
                  type="button"
                  onClick={() => simulateHardwareThumbTouch("security")}
                  className="px-2 py-1.5 rounded-lg border border-ng-border bg-ng-elevated text-[11px] font-mono text-ng-secondary hover:text-green-400 hover:border-green-500/40 cursor-pointer transition-colors"
                >
                  Security ({getStaffFp("security")})
                </button>
              </div>

              <button
                type="button"
                onClick={closeThumbModal}
                className="w-full py-2.5 mt-1 rounded-xl border border-ng-border bg-ng-elevated text-ng-text hover:bg-white/[0.04] text-xs font-mono cursor-pointer transition-colors"
              >
                Cancel / Disarm Sensor
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
