import { useState } from "react";
import StatusPill from "../components/ui/StatusPill";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import type { StatusType, Page } from "../types";
import { GATES, INITIAL_VISITORS } from "../data/mock";
import { useAppContext } from "../components/providers/AppProvider";

interface Props {
  onNavigate?: (p: Page) => void;
}


export default function Dashboard({ onNavigate }: Props) {
  const { liveLogs, wsConnected, alerts, user } = useAppContext();
  const role = (user?.role || "").toLowerCase();
  const isSecurity = role === "security";
  const isWarden = role === "warden";
  const isAdmin = role === "admin";
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [visitors, setVisitors] = useState(INITIAL_VISITORS);

  // Modals state
  const [selectedLog, setSelectedLog] = useState<typeof liveLogs[0] | null>(null);

  const filteredLogs = selectedGate
    ? liveLogs.filter(l => l.gate.toLowerCase() === selectedGate.toLowerCase())
    : liveLogs;

  const handleApproveVisitor = (id: number) => {
    setVisitors(prev => prev.map(v => (v.id === id ? { ...v, status: "approved" as const } : v)));
  };

  const handleRejectVisitor = (id: number) => {
    setVisitors(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="flex flex-col gap-8 select-none">
      {/* Top Gate Status Ribbon */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] font-mono tracking-widest uppercase font-bold text-ng-muted">
            Gate Status Overview
          </div>
          {selectedGate && (
            <button
              onClick={() => setSelectedGate(null)}
              className="text-[11px] font-mono font-bold text-ng-orange bg-ng-orange/10 px-3 py-1.5 rounded-lg border border-ng-orange/20 cursor-pointer hover:bg-ng-orange/20 transition-colors"
            >
              Clear filter ({selectedGate}) ✕
            </button>
          )}
        </div>

        <div className="flex gap-4 flex-wrap">
          {GATES.map(g => {
            const isSelected = selectedGate === g.name;
            return (
              <button
                key={g.name}
                onClick={() => setSelectedGate(isSelected ? null : g.name)}
                className={`flex flex-col gap-3 p-5 rounded-[1.5rem] border cursor-pointer text-left transition-all duration-300 min-w-[150px] flex-1 sm:flex-initial shadow-lg hover:-translate-y-1 ${isSelected
                  ? "bg-ng-orange/10 border-ng-orange/30 shadow-[0_0_20px_rgba(255,107,0,0.15)]"
                  : "bg-ng-panel border-ng-border hover:shadow-2xl hover:border-ng-border/80"
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-sm font-semibold truncate font-display ${isSelected ? "text-ng-orange" : "text-ng-text"}`}>
                    {g.name}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-ng-orange animate-pulse">
                      ●
                    </span>
                  )}
                </div>
                <StatusPill status={g.status} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Feed + Insights Rail */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left: Live Access Log Feed */}
        <div className="rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl bg-ng-panel">
          <div className="px-6 py-5 border-b border-ng-border flex items-center justify-between bg-ng-elevated/30">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-base font-display text-ng-text">
                Live Access Log
              </span>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border shadow-inner tracking-widest uppercase ${wsConnected ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-ng-muted/10 text-ng-muted border-ng-border"}`}>
                <span className={`w-2 h-2 rounded-full ${wsConnected ? "animate-ping bg-green-500" : "bg-ng-muted"}`} />
                {wsConnected ? "Live Stream" : "Demo Mode"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {selectedGate && (
                <span className="text-xs font-mono text-ng-muted">
                  {filteredLogs.length} events matching {selectedGate}
                </span>
              )}
              {onNavigate && filteredLogs.length > 10 && (
                <button
                  onClick={() => onNavigate("logs")}
                  className="text-[11px] font-mono font-bold hover:underline cursor-pointer border-none bg-transparent text-ng-orange"
                >
                  View All ({filteredLogs.length}) →
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-ng-border bg-ng-elevated/10">
                  {["Resident / User", "Gate", "Method", "Timestamp", "Status", ""].map((h, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-4 text-[10px] font-mono uppercase font-bold tracking-widest text-ng-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ng-border">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-xs font-mono text-ng-muted">
                      No access logs recorded yet. Place finger on Live20R scanner to begin.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.slice(0, 10).map(row => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedLog(row)}
                      className="cursor-pointer transition-colors bg-transparent hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <Avatar initials={row.initials} status={row.status} size={36} />
                          <div>
                            <div className="text-sm font-semibold font-display text-ng-text mb-0.5">
                              {row.name}
                            </div>
                            <div className="text-[10px] font-mono text-ng-muted tracking-tight">
                              {row.rollNo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-body text-ng-secondary font-medium">
                        {row.gate}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-ng-secondary">
                        {row.method}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-ng-muted">
                        {row.time}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-mono font-medium text-ng-muted hover:text-ng-orange transition-colors">
                        Inspect →
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Rail: Role-Specific Action Station + Visitor Queue + Alerts */}
        <div className="flex flex-col gap-6">
          {isSecurity ? (
            /* ── Gate Security Operations Station (FR-03 & FR-13) ── */
            <div className="rounded-[2rem] border border-blue-500/20 p-6 shadow-2xl relative overflow-hidden bg-ng-panel group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-blue-400">
                    Gate Station Terminal
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                    Live20R Online
                  </span>
                </div>

                <div className="text-xl font-bold font-display text-ng-text mb-1">
                  Gate Post 01 · Turnstile
                </div>
                <div className="text-xs font-mono text-ng-muted mb-4">
                  Hardware Station · Ready for Scans
                </div>

                <div className="space-y-2.5 mb-5 font-mono text-xs">
                  <div className="p-3 rounded-xl border border-ng-border bg-ng-elevated/40 flex justify-between items-center">
                    <span className="text-ng-muted">Biometric Scanner:</span>
                    <span className="text-green-400 font-bold">Live20R SilkID (Dual Entry/Exit)</span>
                  </div>
                  <div className="p-3 rounded-xl border border-ng-border bg-ng-elevated/40 flex justify-between items-center">
                    <span className="text-ng-muted">Gate State:</span>
                    <span className="text-green-400 font-bold">Operational (Fail-Secure)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("gates")}
                      className="w-full py-3 rounded-xl font-display font-semibold text-xs border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-all cursor-pointer"
                    >
                      Manual Entry Override (FR-03) →
                    </button>
                  )}
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("visitors")}
                      className="w-full py-3 rounded-xl font-display font-semibold text-xs border border-ng-border text-ng-text bg-ng-elevated hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                      + Register Visitor Pass (FR-08)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── AI Anomaly Engine Status (Warden & Admin - FR-06) ── */
            <div className="rounded-[2rem] border border-ng-border p-6 shadow-2xl relative overflow-hidden bg-ng-panel group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-ng-muted">
                    AI Anomaly Engine
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                    Offline / Disconnected
                  </span>
                </div>

                <div className="text-xl font-bold font-display text-ng-text mb-1">
                  Inference Pipeline Inactive
                </div>
                <div className="text-xs font-mono text-ng-muted mb-4">
                  Behavioral model offline · Awaiting sensor telemetry pipeline
                </div>

                <div className="p-4 rounded-xl border border-ng-border bg-ng-elevated/40 text-xs font-body text-ng-secondary leading-relaxed mb-5">
                  The unsupervised anomaly detection engine is not yet connected or operational. Access enforcement is currently managed via deterministic biometric scanning and hardware access rules.
                </div>

                <div className="flex flex-col gap-2.5">
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("logs")}
                      className="w-full py-3 rounded-xl font-display font-semibold text-xs border border-ng-border text-ng-text bg-ng-elevated hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                      View Access Audit Logs →
                    </button>
                  )}
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("visitors")}
                      className="w-full py-3 rounded-xl font-display font-semibold text-xs border border-ng-border text-ng-text bg-ng-elevated hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                      + Register Visitor Pass (FR-08)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

              {/* Visitor Queue Widget */}
              <div className="rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl bg-ng-panel">
                <div className="px-6 py-5 border-b border-ng-border flex items-center justify-between bg-ng-elevated/30">
                  <span className="text-sm font-semibold font-display text-ng-text">
                    Visitor Queue ({visitors.length})
                  </span>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("visitors")}
                      className="text-[11px] font-mono font-bold hover:underline cursor-pointer border-none bg-transparent text-ng-orange"
                    >
                      All Visitors →
                    </button>
                  )}
                </div>

                <div className="divide-y divide-ng-border">
                  {visitors.slice(0, 3).map(v => (
                    <div key={v.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                      <div>
                        <div className="text-sm font-semibold font-display text-ng-text mb-1">
                          {v.name}
                        </div>
                        <div className="text-[10px] font-mono text-ng-muted">
                          Host: {v.host} <span className="mx-1">•</span> {v.since}
                        </div>
                      </div>

                      {v.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveVisitor(v.id)}
                            className="w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-bold cursor-pointer transition-colors bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20"
                            title="Approve visitor"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleRejectVisitor(v.id)}
                            className="w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-bold cursor-pointer transition-colors bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                            title="Reject visitor"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-widest">
                          Approved
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Rail Widget: Hardware Watch for Security vs Recent Alerts for Warden/Admin */}
              {isSecurity ? (
                <div className="rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl bg-ng-panel">
                  <div className="px-6 py-5 border-b border-ng-border flex items-center justify-between bg-ng-elevated/30">
                    <span className="text-sm font-semibold font-display text-ng-text">
                      Turnstiles & Readers
                    </span>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate("gates")}
                        className="text-[11px] font-mono font-bold hover:underline cursor-pointer border-none bg-transparent text-ng-orange"
                      >
                        All Gates →
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-ng-border font-mono text-xs">
                    {GATES.slice(0, 4).map((g) => (
                      <div key={g.name} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          <span className="text-ng-text font-medium">{g.name}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded border border-green-500/20">
                          Operational
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl bg-ng-panel">
                  <div className="px-6 py-5 border-b border-ng-border flex items-center justify-between bg-ng-elevated/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold font-display text-ng-text">
                        Recent Alerts
                      </span>
                      {alerts.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {alerts.length}
                        </span>
                      )}
                    </div>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate("alerts")}
                        className="text-[11px] font-mono font-bold hover:underline cursor-pointer border-none bg-transparent text-ng-orange"
                      >
                        {alerts.length > 5 ? `All Alerts (${alerts.length}) →` : "Manage →"}
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-ng-border">
                    {alerts.length === 0 ? (
                      <div className="p-6 text-center text-xs font-mono text-ng-muted">
                        No active security alerts. System is normal.
                      </div>
                    ) : (
                      alerts.slice(0, 5).map(a => {
                        const isCritical = a.sev === "critical";
                        return (
                          <div
                            key={a.id}
                            className={`p-5 border-l-4 flex items-center justify-between transition-colors ${isCritical ? "border-l-red-500 bg-red-500/5 hover:bg-red-500/10" : "border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10"
                              }`}
                          >
                            <div>
                              <p className="text-sm font-medium m-0 truncate font-body text-ng-text mb-1.5">
                                {a.msg || a.title}
                              </p>
                              <span className="text-[10px] font-mono font-bold text-ng-muted uppercase tracking-widest">
                                {a.time}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
                              </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <Modal
            isOpen={Boolean(selectedLog)}
            onClose={() => setSelectedLog(null)}
            title={`Access Event · ${selectedLog.id}`}
            subtitle={`Cryptographic verification log for ${selectedLog.name}`}
          >
            <div className="flex flex-col gap-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-ng-border bg-ng-elevated shadow-inner">
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-ng-muted block mb-1.5">Resident</span>
                  <span className="font-semibold text-base font-display text-ng-text block mb-0.5">{selectedLog.name}</span>
                  <span className="text-[11px] font-mono text-ng-secondary block">{selectedLog.rollNo}</span>
                </div>
                <div className="p-4 rounded-xl border border-ng-border bg-ng-elevated shadow-inner">
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-ng-muted block mb-1.5">Location / Gate</span>
                  <span className="font-semibold text-base font-display text-ng-text block mb-0.5">{selectedLog.gate}</span>
                  <span className="text-[11px] font-mono text-ng-secondary block">Timestamp: {selectedLog.time}</span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-ng-border bg-ng-elevated shadow-inner font-mono space-y-3 mt-1 text-xs">
                <div className="flex justify-between items-center border-b border-ng-border/50 pb-2">
                  <span className="text-ng-muted">Verification Method:</span>
                  <span className="text-ng-text font-bold">{selectedLog.method} Biometric</span>
                </div>
                <div className="flex justify-between items-center border-b border-ng-border/50 pb-2">
                  <span className="text-ng-muted">Biometric Confidence:</span>
                  <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20 font-bold">{selectedLog.confidence}% Match</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ng-muted">Terminal Hash:</span>
                  <span className="text-ng-secondary bg-ng-bg px-2 py-0.5 rounded border border-white/[0.02]">0x7b4a...f92c</span>
                </div>
              </div>

              <div className="flex justify-end pt-5 mt-2 border-t border-ng-border">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2.5 rounded-xl font-display font-medium text-sm border border-ng-border bg-ng-elevated text-ng-text hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  Close Audit Record
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
      );
}
