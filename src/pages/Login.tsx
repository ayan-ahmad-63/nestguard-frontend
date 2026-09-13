import React, { useState } from "react";
import { LogoLockup } from "../components/ui/Logo";
import FloatingThemeToggle from "../components/ui/FloatingThemeToggle";
import Icon3D from "../components/ui/Icon3D";

interface Props {
  onLogin: () => void;
  onBack?: () => void;
}

export default function Login({ onLogin, onBack }: Props) {
  const [email, setEmail] = useState("warden@nestguard.in");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setError(null);
    onLogin();
  };

  const handleBiometricScan = () => {
    setScanning(true);
    setError(null);
    setTimeout(() => {
      setScanning(false);
      onLogin();
    }, 1200);
  };

  const fillDemo = (role: "warden" | "admin") => {
    if (role === "warden") {
      setEmail("warden@nestguard.in");
      setPassword("HostelSecurity2026!");
    } else {
      setEmail("admin@nestguard.in");
      setPassword("SuperAdminSecurePass#");
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

      <FloatingThemeToggle />

      <div className="w-full max-w-md rounded-3xl border border-ng-border bg-ng-panel/80 backdrop-blur-2xl p-8 sm:p-10 relative z-10 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none blur-[60px] opacity-20 bg-ng-orange" />

        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-10 text-center relative z-10">
          <LogoLockup variant="stacked" height={130} />
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo("warden")}
                className="px-2.5 py-1 rounded-lg border border-ng-border bg-ng-elevated text-[10px] font-mono cursor-pointer transition-colors text-ng-secondary hover:text-ng-orange hover:border-ng-orange/50"
              >
                Warden
              </button>
              <button
                type="button"
                onClick={() => fillDemo("admin")}
                className="px-2.5 py-1 rounded-lg border border-ng-border bg-ng-elevated text-[10px] font-mono cursor-pointer transition-colors text-ng-secondary hover:text-ng-orange hover:border-ng-orange/50"
              >
                Admin
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-xl font-display font-semibold text-sm text-white border-none cursor-pointer transition-all duration-300 bg-ng-orange hover:brightness-110 shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:shadow-[0_0_30px_rgba(255,107,0,0.4)] active:scale-[0.98]"
          >
            Authenticate & Launch Console
          </button>

          {/* Biometric Hardware Bypass Option */}
          <div className="relative flex items-center justify-center my-2">
            <span className="w-full border-b border-ng-border" />
            <span className="absolute px-3 text-[10px] font-mono uppercase tracking-widest bg-transparent text-ng-muted" style={{ background: "var(--ng-panel)" }}>
              Or Biometric Token
            </span>
          </div>

          <button
            type="button"
            onClick={handleBiometricScan}
            disabled={scanning}
            className="w-full py-3 rounded-xl font-display font-medium text-sm border cursor-pointer transition-all flex items-center justify-center gap-2 bg-ng-elevated border-ng-border text-ng-text hover:bg-white/[0.02]"
            style={{
              borderColor: scanning ? "var(--color-ng-green)" : "",
              color: scanning ? "var(--color-ng-green)" : "",
            }}
          >
            {scanning ? (
              <>
                <span className="w-2 h-2 rounded-full animate-ping bg-green-500" />
                <span>Scanning Hardware Reader…</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Authenticate with FIDO2 / Fingerprint</span>
              </>
            )}
          </button>
        </form>

        <p className="font-mono text-[10px] text-center mt-8 leading-relaxed text-ng-muted relative z-10">
          NestGuard v2.4.1 · Multi-Tenant Security Gateway
          <br />
          Authorised staff only. Access attempts are cryptographically signed.
        </p>
      </div>
    </div>
  );
}
