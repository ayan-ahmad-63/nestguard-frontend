import { useState } from "react";
import StatusPill from "../components/ui/StatusPill";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import type { StatusType, Page } from "../types";
import { GATES, INITIAL_LOGS, INITIAL_VISITORS, INITIAL_ALERTS } from "../data/mock";

interface Props {
  onNavigate?: (p: Page) => void;
}


export default function Dashboard({ onNavigate }: Props) {
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [logs] = useState(INITIAL_LOGS);
  const [visitors, setVisitors] = useState(INITIAL_VISITORS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [aiReviewed, setAiReviewed] = useState(false);
  const [selectedLog, setSelectedLog] = useState<typeof INITIAL_LOGS[0] | null>(null);

  const filteredLogs = selectedGate
    ? logs.filter(l => l.gate.toLowerCase() === selectedGate.toLowerCase())
    : logs;

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
                className={`flex flex-col gap-3 p-5 rounded-[1.5rem] border cursor-pointer text-left transition-all duration-300 min-w-[150px] flex-1 sm:flex-initial shadow-lg hover:-translate-y-1 ${
                  isSelected 
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
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold bg-green-500/10 text-green-500 border border-green-500/20 shadow-inner tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full animate-ping bg-green-500" />
                Live Stream
              </span>
            </div>
            {selectedGate && (
              <span className="text-xs font-mono text-ng-muted">
                {filteredLogs.length} events matching {selectedGate}
              </span>
            )}
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
                {filteredLogs.map(row => (
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
                            {row.roll}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Rail: AI Recommends + Visitor Queue + Alerts */}
        <div className="flex flex-col gap-6">
          {/* AI Recommends Box */}
          <div className="rounded-[2rem] border border-ng-orange/20 p-6 shadow-2xl relative overflow-hidden bg-ng-panel group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-ng-orange/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-ng-orange/20 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-ng-orange">
                  AI Anomaly Engine
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-ng-orange/10 text-ng-orange border border-ng-orange/20">
                  Active Model v2.4
                </span>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="relative w-[72px] h-[72px] shrink-0 flex items-center justify-center">
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="var(--color-ng-border)" strokeWidth="6" />
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      fill="none"
                      stroke="var(--color-ng-orange)"
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 30 * 0.87} ${2 * Math.PI * 30 * 0.13}`}
                      strokeDashoffset={2 * Math.PI * 30 * 0.25}
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_8px_rgba(255,107,0,0.6)]"
                    />
                  </svg>
                  <span className="absolute text-base font-bold font-mono text-ng-text drop-shadow-md">
                    87%
                  </span>
                </div>
                <div>
                  <div className="text-xl font-bold font-display text-ng-text mb-1">
                    Risk Score: High
                  </div>
                  <div className="text-xs font-mono text-ng-muted">
                    Confidence rating 87%
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-6 font-body text-ng-secondary bg-ng-elevated/50 p-4 rounded-xl border border-ng-border shadow-inner">
                {aiReviewed
                  ? <span className="text-green-500 font-semibold flex items-start gap-2"><span className="shrink-0 text-lg">✓</span> Incident flagged. Suresh Kumar's credential token has been quarantined pending warden interview.</span>
                  : "Suresh Kumar's late-hour scan at Service Entry deviates from 30-day baseline. Verification recommended."}
              </p>

              <button
                onClick={() => setReviewModalOpen(true)}
                className="w-full py-3.5 rounded-xl font-display font-semibold text-sm text-white border-none cursor-pointer transition-all duration-300 bg-ng-orange hover:brightness-110 shadow-[0_0_20px_rgba(255,107,0,0.4)] active:scale-[0.98]"
              >
                {aiReviewed ? "Review Quarantined Event" : "Review Event & Act"}
              </button>
            </div>
          </div>

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

          {/* Quick Alerts Widget */}
          <div className="rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl bg-ng-panel">
            <div className="px-6 py-5 border-b border-ng-border flex items-center justify-between bg-ng-elevated/30">
              <span className="text-sm font-semibold font-display text-ng-text">
                Recent Alerts
              </span>
              {onNavigate && (
                <button
                  onClick={() => onNavigate("alerts")}
                  className="text-[11px] font-mono font-bold hover:underline cursor-pointer border-none bg-transparent text-ng-orange"
                >
                  Manage →
                </button>
              )}
            </div>

            <div className="divide-y divide-ng-border">
              {alerts.map(a => {
                const isCritical = a.sev === "critical";
                return (
                  <div
                    key={a.id}
                    className={`p-5 border-l-4 flex items-center justify-between transition-colors ${
                      isCritical ? "border-l-red-500 bg-red-500/5 hover:bg-red-500/10" : "border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium m-0 truncate font-body text-ng-text mb-1.5">
                        {a.msg}
                      </p>
                      <span className="text-[10px] font-mono font-bold text-ng-muted uppercase tracking-widest">
                        {a.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Review Event Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="AI Anomaly Analysis · Event Review"
        subtitle="Algorithmic risk evaluation for credential BSE-2023-014"
      >
        <div className="flex flex-col gap-6 text-sm font-body">
          <div className="p-5 rounded-xl border border-ng-border bg-ng-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
            <div>
              <div className="font-semibold text-base font-display text-ng-text mb-1">
                Suresh Kumar
              </div>
              <div className="font-mono text-xs text-ng-secondary">
                Roll: BSE-2023-014 <span className="mx-1">•</span> Hostel Block B Room 302
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl font-mono font-bold text-[11px] uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              HIGH RISK (87%)
            </span>
          </div>

          <div className="px-2">
            <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-ng-muted">
              Detection Factors:
            </span>
            <ul className="mt-4 space-y-3 list-disc list-inside text-ng-secondary leading-relaxed">
              <li>Access attempted at 09:27:55 via Service Entry (restricted gate).</li>
              <li>Deviates by 4.2 hours from 30-day student entry baseline.</li>
              <li>3 previous failed attempts detected at Main Gate earlier this morning.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-ng-border justify-end mt-2">
            <button
              onClick={() => {
                setAiReviewed(true);
                setReviewModalOpen(false);
              }}
              className="px-6 py-2.5 rounded-xl font-display font-medium text-sm border border-ng-border bg-ng-elevated text-ng-text hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              Dismiss (False Positive)
            </button>
            <button
              onClick={() => {
                setAiReviewed(true);
                setReviewModalOpen(false);
              }}
              className="px-6 py-2.5 rounded-xl font-display font-semibold text-sm text-white border-none bg-red-500 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer"
            >
              Restrict Card & Flag Student
            </button>
          </div>
        </div>
      </Modal>

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
                <span className="text-[11px] font-mono text-ng-secondary block">{selectedLog.roll}</span>
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
