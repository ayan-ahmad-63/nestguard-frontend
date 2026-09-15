import { useState } from "react";
import type { AlertItem, AlertSeverity } from "../types";

const INITIAL_ALERTS: AlertItem[] = [
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
  {
    id: 4,
    sev: "safe",
    time: "08:30:44",
    title: "Emergency unlock drill executed",
    detail: "Warden initiated scheduled safety drill for Block B. All exit barriers disengaged and auto-relocked at 08:35:00.",
    gate: "Block B",
    user: "A. Warden",
    acknowledged: true,
  },
  {
    id: 5,
    sev: "critical",
    time: "07:58:20",
    title: "After-hours access attempt",
    detail: "Card scan detected at Rear Exit outside designated student permit curfew window (06:00 - 22:00).",
    gate: "Rear Exit",
    user: "Rohan Lal",
    acknowledged: false,
  },
  {
    id: 6,
    sev: "attention",
    time: "07:40:03",
    title: "Multiple failed verification attempts",
    detail: "Resident failed biometric match 5 times at Main Gate before succeeding via supervisor bypass.",
    gate: "Main Gate",
    user: "Suresh Kumar",
    acknowledged: false,
  },
];

const SEV_LABEL: Record<AlertSeverity, string> = {
  critical: "CRITICAL",
  attention: "ATTENTION",
  safe: "RESOLVED",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [filter, setFilter] = useState<string>("All");

  const handleAcknowledge = (id: number) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, acknowledged: true, sev: "safe" as AlertSeverity } : a)),
    );
  };

  const filtered = alerts.filter(a => {
    if (filter === "All") return true;
    if (filter === "Active") return !a.acknowledged;
    if (filter === "Critical") return a.sev === "critical";
    if (filter === "Attention") return a.sev === "attention";
    if (filter === "Resolved") return a.acknowledged || a.sev === "safe";
    return true;
  });

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {["All", "Active", "Critical", "Attention", "Resolved"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors border ${
                filter === tab 
                  ? "bg-ng-orange/10 border-ng-orange/30 text-ng-orange shadow-[0_0_15px_rgba(255,107,0,0.1)]" 
                  : "bg-ng-panel border-ng-border text-ng-secondary hover:text-ng-text hover:bg-ng-elevated"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-ng-muted">
          {filtered.length} alerts in log
        </span>
      </div>

      {/* Alert Feed */}
      <div className="rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl bg-ng-panel relative">
        <div className="divide-y divide-ng-border">
          {filtered.map(alert => {
            const isOpen = expanded === alert.id;
            
            // Determine active colors based on severity
            let activeColorClass = "";
            let pillClass = "";
            
            if (alert.sev === "critical") {
              activeColorClass = "border-red-500 shadow-[inset_4px_0_0_0_rgba(239,68,68,1)]";
              pillClass = "bg-red-500/10 text-red-500 border-red-500/20";
            } else if (alert.sev === "attention") {
              activeColorClass = "border-amber-500 shadow-[inset_4px_0_0_0_rgba(245,158,11,1)]";
              pillClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
            } else {
              activeColorClass = "border-green-500 shadow-[inset_4px_0_0_0_rgba(34,197,94,1)]";
              pillClass = "bg-green-500/10 text-green-500 border-green-500/20";
            }

            return (
              <div
                key={alert.id}
                className={`transition-colors border-l-4 ${isOpen ? "bg-ng-elevated" : "bg-transparent"} ${activeColorClass}`}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : alert.id)}
                  className="w-full bg-transparent border-none cursor-pointer px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 tracking-widest ${pillClass}`}>
                      {SEV_LABEL[alert.sev]}
                    </span>
                    <span className="font-semibold text-sm flex-1 truncate font-display text-ng-text">
                      {alert.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 sm:mt-0 justify-between sm:justify-end w-full sm:w-auto">
                    <span className="text-xs font-mono text-ng-muted shrink-0">
                      {alert.time}
                    </span>
                    <span className={`text-xs w-4 h-4 flex items-center justify-center rounded-full bg-ng-elevated border border-ng-border transition-transform ${isOpen ? "rotate-180" : ""} text-ng-secondary`}>
                      ▼
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 flex flex-col lg:flex-row gap-6 border-t border-ng-border/50 ml-1">
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed m-0 mb-5 font-body text-ng-secondary bg-ng-bg/50 p-4 rounded-xl border border-ng-border/50 shadow-inner">
                        {alert.detail}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white border-none cursor-pointer transition-all bg-ng-orange font-display hover:brightness-110 shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                          >
                            Acknowledge Alert
                          </button>
                        )}
                        <button className="px-5 py-2.5 rounded-xl text-xs font-mono border cursor-pointer transition-colors bg-transparent border-ng-border text-ng-text hover:bg-white/[0.05]">
                          Trace Access Log
                        </button>
                      </div>
                    </div>

                    <div className="w-full lg:w-64 p-4 rounded-xl border flex flex-col gap-3 font-mono text-[11px] bg-ng-bg border-ng-border shadow-inner shrink-0">
                      <div className="flex justify-between items-center border-b border-ng-border/50 pb-2">
                        <span className="text-ng-muted uppercase tracking-widest font-bold text-[9px]">Location</span>
                        <span className="text-ng-text font-semibold">{alert.gate}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-ng-border/50 pb-2">
                        <span className="text-ng-muted uppercase tracking-widest font-bold text-[9px]">Subject</span>
                        <span className="text-ng-text font-semibold">{alert.user}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ng-muted uppercase tracking-widest font-bold text-[9px]">Status</span>
                        <span className={`font-semibold ${alert.acknowledged ? "text-green-500" : "text-amber-500"}`}>
                          {alert.acknowledged ? "Resolved" : "Awaiting Review"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
