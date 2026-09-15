import React from "react";
import type { Page } from "../../types";
import Link from "next/link";
import Image from "next/image";

export { type Page };

interface NavItem {
  id: Page;
  label: string;
  badge?: number;
}

const ICONS: Record<Page, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  gates: (
    <>
      <path d="M4.5 21V5.2" />
      <circle cx="4.5" cy="4.3" r="1.4" />
      <path d="M6 6 20 10" />
      <path d="M8 21h12" />
      <path d="M11 10.2v3.3M14 11v3.3M17 11.8v3.2" />
    </>
  ),
  logs: (
    <>
      <path d="M8.5 6h11.5M8.5 12h11.5M8.5 18h11.5" />
      <circle cx="4.4" cy="6" r="1.1" />
      <circle cx="4.4" cy="12" r="1.1" />
      <circle cx="4.4" cy="18" r="1.1" />
    </>
  ),
  visitors: (
    <>
      <circle cx="9.5" cy="8" r="3.7" />
      <path d="M3 20.5a6.5 6.5 0 0 1 13 0" />
      <path d="M19 7.5v6M22 10.5h-6" />
    </>
  ),
  alerts: (
    <>
      <path d="M6 9.5a6 6 0 0 1 12 0c0 4.5 1.8 5.8 2.4 6.3.4.3.2 1-.4 1H4c-.6 0-.8-.7-.4-1 .6-.5 2.4-1.8 2.4-6.3Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 3.5v15a2 2 0 0 0 2 2h15" />
      <rect x="8.5" y="11" width="2.6" height="6" rx="1" />
      <rect x="13.2" y="7.5" width="2.6" height="9.5" rx="1" />
      <rect x="17.9" y="9.5" width="2.6" height="7.5" rx="1" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="12" height="10.5" rx="2.5" />
      <path d="M15 10.5 20.4 7.6c.4-.2 1 .1 1 .6v7.6c0 .5-.6.8-1 .6L15 14Z" />
      <circle cx="8" cy="12.2" r="0.4" fill="currentColor" stroke="none" />
    </>
  ),
  devices: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3" />
    </>
  ),
};

function NavIcon({ id, active }: { id: Page; active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-colors ${active ? "text-ng-orange" : "currentColor"}`}
      aria-hidden="true"
    >
      {ICONS[id]}
    </svg>
  );
}

interface Props {
  active: Page;
  expanded: boolean;
  onToggle: () => void;
  alertCount?: number;
  visitorCount?: number;
}

export default function Sidebar({
  active,
  expanded,
  onToggle,
  alertCount = 0,
  visitorCount = 0,
}: Props) {
  const NAV: NavItem[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "gates", label: "Gates & Readers" },
    { id: "logs", label: "Access Logs" },
    { id: "visitors", label: "Visitors", badge: visitorCount > 0 ? visitorCount : undefined },
    { id: "alerts", label: "Security Alerts", badge: alertCount > 0 ? alertCount : undefined },
    { id: "analytics", label: "Analytics" },
    { id: "camera", label: "Live Camera" },
    { id: "devices", label: "Device Health" },
  ];

  const width = expanded ? 260 : 80;

  return (
    <aside
      className="shrink-0 h-full flex flex-col select-none transition-all duration-300 overflow-hidden bg-transparent border-r border-ng-border"
      style={{ width }}
    >
      {/* Brand Header */}
      <Link
        href="/dashboard"
        className={`h-16 flex items-center gap-3.5 shrink-0 border-b border-ng-border cursor-pointer no-underline hover:bg-white/[0.02] transition-colors ${expanded ? "px-6" : "justify-center"}`}
        title="NestGuard Dashboard"
      >
        <Image src="/logo-mark.png" alt="NestGuard Logo Mark" width={553} height={587} className="h-10 w-10 object-contain shrink-0" priority />
        {expanded && (
          <span className="font-semibold text-lg whitespace-nowrap tracking-tight font-display text-ng-text">
            NestGuard
          </span>
        )}
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden flex flex-col gap-1 px-3">
        {NAV.map(({ id, label, badge }) => {
          const isActive = active === id;
          return (
            <Link
              key={id}
              href={`/${id}`}
              title={!expanded ? label : undefined}
              className={`relative flex items-center w-full h-11 text-sm font-medium cursor-pointer border-none transition-all duration-200 text-left whitespace-nowrap no-underline rounded-xl font-display ${isActive ? "text-ng-orange bg-ng-orange/10" : "text-ng-secondary hover:text-ng-text hover:bg-ng-elevated"} ${expanded ? "px-3 gap-3" : "justify-center"}`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-ng-orange shadow-[0_0_12px_var(--color-ng-orange)]" />
              )}
              <span className="w-6 flex justify-center shrink-0">
                <NavIcon id={id} active={isActive} />
              </span>
              {expanded && <span className="flex-1 truncate">{label}</span>}
              {expanded && badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${id === "alerts" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <button
        onClick={onToggle}
        className={`h-14 flex items-center text-xs border-t border-ng-border cursor-pointer transition-colors text-ng-muted hover:text-ng-secondary hover:bg-white/[0.02] font-mono bg-transparent ${expanded ? "px-6 justify-end" : "justify-center"}`}
        title={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {expanded ? "← Collapse" : "→"}
      </button>
    </aside>
  );
}
