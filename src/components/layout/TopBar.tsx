import { useState, useRef, useEffect } from "react";
import type { Page, AlertItem } from "../../types";
import FloatingThemeToggle from "../ui/FloatingThemeToggle";

const CRUMBS: Record<Page, string[]> = {
  dashboard: ["Console", "Dashboard"],
  gates: ["Infrastructure", "Gates & Readers"],
  logs: ["Audit", "Access Logs"],
  visitors: ["Access", "Visitors Management"],
  alerts: ["Monitoring", "Security Alerts"],
  analytics: ["Intelligence", "Behavior Analytics"],
  camera: ["Surveillance", "Live Camera"],
  devices: ["Hardware", "Device Health"],
};

interface Props {
  page: Page;
  onNavigate?: (p: Page) => void;
  onLogout?: () => void;
  alerts?: AlertItem[];
}

export default function TopBar({ page, onNavigate, onLogout, alerts = [] }: Props) {
  const crumbs = CRUMBS[page];
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadAlerts = alerts.filter(a => !a.acknowledged);
  const unreadCount = unreadAlerts.length;

  const searchItems = [
    { title: "Main Gate", cat: "Gates", page: "gates" as Page },
    { title: "Service Entry", cat: "Gates", page: "gates" as Page },
    { title: "Rahul Sharma (RS)", cat: "Student Log", page: "logs" as Page },
    { title: "Suresh Kumar (SK)", cat: "High Risk Student", page: "analytics" as Page },
    { title: "Block C Reader", cat: "Device", page: "devices" as Page },
    { title: "Live Camera Feeds", cat: "Surveillance", page: "camera" as Page },
  ].filter(item =>
    searchQuery.trim() === ""
      ? true
      : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cat.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <header className="shrink-0 h-16 flex items-center px-6 gap-5 border-b border-ng-border relative z-30 select-none bg-ng-panel/50 backdrop-blur-3xl">
      {/* Breadcrumbs */}
      <div className="flex-1 flex items-center gap-2 text-xs font-display">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-ng-muted">/</span>}
            <span className={i === crumbs.length - 1 ? "text-ng-text font-semibold" : "text-ng-muted font-medium"}>
              {c}
            </span>
          </span>
        ))}
      </div>

      {/* Global Search Bar */}
      <div className="relative" ref={searchRef}>
        <div
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm w-48 sm:w-64 cursor-text transition-all bg-ng-elevated ${searchOpen ? "border-ng-orange shadow-[0_0_12px_rgba(255,107,0,0.2)]" : "border-ng-border"}`}
          onClick={() => setSearchOpen(true)}
        >
          <span className="text-ng-muted">⌕</span>
          <input
            placeholder="Search console (Ctrl+K)…"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="bg-transparent border-none outline-none w-full text-sm font-body text-ng-text placeholder-ng-muted"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchOpen && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] w-72 rounded-2xl border border-ng-border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 bg-ng-panel">
            <div className="text-[10px] uppercase font-mono px-3 py-2 mb-1 text-ng-muted font-bold tracking-widest">
              Quick Navigation
            </div>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              {searchItems.length > 0 ? (
                searchItems.map((it, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onNavigate) onNavigate(it.page);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-left cursor-pointer border border-transparent transition-colors hover:bg-ng-elevated hover:border-ng-border"
                  >
                    <span className="font-display text-sm text-ng-text font-medium">
                      {it.title}
                    </span>
                    <span className="font-mono text-[10px] text-ng-muted">
                      {it.cat}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs font-mono text-ng-muted">
                  No matching results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-ng-border hidden sm:block" />

      {/* Theme Toggle inline */}
      <FloatingThemeToggle className="relative transition-transform hover:scale-105 cursor-pointer shrink-0 ml-1" />

      {/* Notification Bell Dropdown */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(n => !n)}
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border transition-colors ${notifOpen ? "bg-ng-elevated border-ng-border text-ng-text" : "bg-transparent border-transparent text-ng-secondary hover:bg-white/[0.02]"}`}
          aria-label="Notifications"
        >
          <span className="text-lg">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 text-[9px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold text-white shadow-md bg-red-500 font-mono ring-2 ring-ng-panel">
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] mt-2 w-80 rounded-2xl border border-ng-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 bg-ng-panel">
            <div className="px-5 py-4 border-b border-ng-border flex items-center justify-between bg-ng-elevated/30">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm font-display text-ng-text">
                  Security Alerts
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                  {unreadCount} Unresolved
                </span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => {
                    onNavigate("alerts");
                    setNotifOpen(false);
                  }}
                  className="text-[11px] hover:underline cursor-pointer text-ng-orange font-mono bg-transparent border-none"
                >
                  View All →
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-ng-border">
              {unreadAlerts.slice(0, 4).map(alert => (
                <div
                  key={alert.id}
                  onClick={() => {
                    if (onNavigate) onNavigate("alerts");
                    setNotifOpen(false);
                  }}
                  className="p-4 cursor-pointer transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${alert.sev === "critical" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                      {alert.sev.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-ng-muted">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-sm font-medium m-0 truncate font-body text-ng-text mb-1">
                    {alert.title}
                  </p>
                  <p className="text-[11px] m-0 truncate font-mono text-ng-secondary">
                    {alert.gate} · {alert.user}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Profile Dropdown */}
      <div className="relative" ref={userRef}>
        <div
          className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl transition-colors border border-transparent hover:bg-ng-elevated hover:border-ng-border"
          onClick={() => setUserMenuOpen(u => !u)}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md bg-ng-orange font-display">
            AW
          </div>
          <div className="hidden sm:block text-left leading-tight pr-1">
            <div className="text-sm font-semibold font-display text-ng-text mb-0.5">
              A. Warden
            </div>
            <div className="text-[10px] font-mono text-ng-muted">
              Hostel Admin
            </div>
          </div>
        </div>

        {userMenuOpen && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] mt-2 w-56 rounded-2xl border border-ng-border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 bg-ng-panel">
            <div className="px-4 py-3 border-b border-ng-border bg-ng-elevated/30 rounded-t-xl mb-1">
              <div className="text-sm font-semibold font-display text-ng-text mb-0.5">
                Chief Warden
              </div>
              <div className="text-xs truncate font-mono text-ng-muted">
                warden@nestguard.in
              </div>
            </div>
            <div className="py-1">
              {onLogout && (
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm cursor-pointer transition-colors flex items-center gap-3 text-red-500 font-display font-medium hover:bg-red-500/10 hover:shadow-inner border border-transparent hover:border-red-500/20"
                >
                  <span className="text-lg">⎋</span>
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
