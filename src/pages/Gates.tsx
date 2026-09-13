import { useState } from "react";
import StatusPill from "../components/ui/StatusPill";
import Modal from "../components/ui/Modal";
import type { StatusType, Gate } from "../types";

const INITIAL_GATES: Gate[] = [
  {
    name: "Main Gate",
    status: "safe" as StatusType,
    id: "G-001",
    location: "Campus Entrance A",
    devices: [
      { label: "Battery", value: "92%", bar: 0.92, color: "#22c55e" },
      { label: "Signal", value: "−54 dBm", bar: 0.8, color: "#22c55e" },
      { label: "Last Seen", value: "09:41:02", bar: null, color: null },
      { label: "Uptime", value: "14d 06h", bar: null, color: null },
    ],
  },
  {
    name: "Block A",
    status: "attention" as StatusType,
    id: "G-002",
    location: "Boys Hostel Block A",
    devices: [
      { label: "Battery", value: "67%", bar: 0.67, color: "#f59e0b" },
      { label: "Signal", value: "−72 dBm", bar: 0.55, color: "#f59e0b" },
      { label: "Last Seen", value: "09:38:17", bar: null, color: null },
      { label: "Uptime", value: "9d 14h", bar: null, color: null },
    ],
  },
  {
    name: "Block B",
    status: "safe" as StatusType,
    id: "G-003",
    location: "Boys Hostel Block B",
    devices: [
      { label: "Battery", value: "88%", bar: 0.88, color: "#22c55e" },
      { label: "Signal", value: "−61 dBm", bar: 0.72, color: "#22c55e" },
      { label: "Last Seen", value: "09:35:44", bar: null, color: null },
      { label: "Uptime", value: "21d 02h", bar: null, color: null },
    ],
  },
  {
    name: "Block C",
    status: "safe" as StatusType,
    id: "G-004",
    location: "Girls Hostel Block C",
    devices: [
      { label: "Battery", value: "74%", bar: 0.74, color: "#22c55e" },
      { label: "Signal", value: "−68 dBm", bar: 0.62, color: "#f59e0b" },
      { label: "Last Seen", value: "08:54:18", bar: null, color: null },
      { label: "Uptime", value: "3d 18h", bar: null, color: null },
    ],
  },
  {
    name: "Service Entry",
    status: "critical" as StatusType,
    id: "G-005",
    location: "Mess & Logistics Gate",
    devices: [
      { label: "Battery", value: "23%", bar: 0.23, color: "#ef4444" },
      { label: "Signal", value: "−89 dBm", bar: 0.28, color: "#ef4444" },
      { label: "Last Seen", value: "09:27:55", bar: null, color: null },
      { label: "Uptime", value: "0d 11h", bar: null, color: null },
    ],
  },
  {
    name: "Rear Exit",
    status: "safe" as StatusType,
    id: "G-006",
    location: "Perimeter Emergency Path",
    devices: [
      { label: "Battery", value: "81%", bar: 0.81, color: "#22c55e" },
      { label: "Signal", value: "−57 dBm", bar: 0.77, color: "#22c55e" },
      { label: "Last Seen", value: "09:15:40", bar: null, color: null },
      { label: "Uptime", value: "7d 09h", bar: null, color: null },
    ],
  },
];

export default function Gates() {
  const [gates, setGates] = useState(INITIAL_GATES);
  const [expanded, setExpanded] = useState<string | null>("G-001");
  const [actionGate, setActionGate] = useState<{ gate: Gate; action: "unlock" | "lockdown" | "ping" } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleActionConfirm = () => {
    if (!actionGate) return;
    const { gate, action } = actionGate;

    if (action === "unlock") {
      setGates(prev =>
        prev.map(g => (g.id === gate.id ? { ...g, status: "attention" as StatusType } : g))
      );
      setNotification(`✓ Emergency override sent: ${gate.name} is now UNLOCKED.`);
    } else if (action === "lockdown") {
      setGates(prev =>
        prev.map(g => (g.id === gate.id ? { ...g, status: "critical" as StatusType } : g))
      );
      setNotification(`⚠ Lockdown engaged for ${gate.name}. Readers halted.`);
    } else if (action === "ping") {
      setNotification(`✓ Ping response from ${gate.name} (${gate.id}): 18ms latency (nominal).`);
    }

    setActionGate(null);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {notification && (
        <div className="p-4 rounded-xl border border-green-500/30 text-xs font-mono font-bold flex items-center justify-between animate-in fade-in duration-200 bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="cursor-pointer border-none bg-transparent text-green-500 hover:text-green-400 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gates.map(gate => {
          const isOpen = expanded === gate.id;
          return (
            <div
              key={gate.id}
              className={`rounded-[2rem] border overflow-hidden transition-all duration-300 bg-ng-panel shadow-xl ${isOpen ? "border-ng-orange shadow-[0_0_20px_rgba(255,107,0,0.15)] bg-white/[0.02]" : "border-ng-border hover:shadow-2xl hover:-translate-y-1 hover:border-ng-border/80"}`}
            >
              {/* Card Header Accordion */}
              <button
                onClick={() => setExpanded(isOpen ? null : gate.id)}
                className="w-full bg-transparent border-none cursor-pointer p-5 flex items-center gap-4 text-left group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border transition-colors ${isOpen ? "bg-ng-orange/10 border-ng-orange/30 text-ng-orange" : "bg-ng-elevated border-ng-border text-ng-secondary group-hover:bg-white/[0.05]"}`}
                >
                  ⛩
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate font-display text-ng-text mb-0.5">
                    {gate.name}
                  </div>
                  <div className="text-[11px] font-mono text-ng-muted tracking-tight">
                    {gate.id} · {gate.location}
                  </div>
                </div>
                <StatusPill status={gate.status} />
                <span className={`text-xs ml-2 text-ng-secondary transition-transform ${isOpen ? "rotate-180 text-ng-orange" : ""}`}>
                  ▼
                </span>
              </button>

              {/* Telemetry & Controls Drawer */}
              {isOpen && (
                <div className="border-t p-5 flex flex-col gap-5 animate-in fade-in duration-300 border-ng-border/50 bg-ng-elevated/30 shadow-inner">
                  <div className="grid grid-cols-2 gap-3">
                    {gate.devices.map(d => (
                      <div
                        key={d.label}
                        className="p-3.5 rounded-xl border flex flex-col gap-1.5 bg-ng-panel border-ng-border shadow-sm hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                          <span className="text-ng-muted">{d.label}</span>
                          <span style={{ color: d.color ?? "var(--color-ng-text)" }} className="font-bold text-xs">
                            {d.value}
                          </span>
                        </div>
                        {d.bar !== null && (
                          <div className="w-full h-1.5 rounded-full overflow-hidden bg-ng-bg shadow-inner mt-1">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${d.bar * 100}%`,
                                background: d.color ?? "#22c55e",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Operational Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={() => setActionGate({ gate, action: "unlock" })}
                      className="w-full py-2.5 rounded-xl text-xs font-display font-semibold border cursor-pointer transition-all bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                    >
                      Emergency Unlock
                    </button>
                    <button
                      onClick={() => setActionGate({ gate, action: "lockdown" })}
                      className="w-full py-2.5 rounded-xl text-xs font-display font-semibold border cursor-pointer transition-all bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                    >
                      Lockdown
                    </button>
                    <button
                      onClick={() => setActionGate({ gate, action: "ping" })}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono font-semibold border cursor-pointer transition-colors bg-ng-panel border-ng-border text-ng-text hover:bg-white/[0.05]"
                      title="Ping Hardware Controller"
                    >
                      Ping
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {actionGate && (
        <Modal
          isOpen={Boolean(actionGate)}
          onClose={() => setActionGate(null)}
          title={`Confirm Gate Control Action`}
          subtitle={`Target: ${actionGate.gate.name} (${actionGate.gate.id})`}
        >
          <div className="flex flex-col gap-6 text-sm">
            <p className="leading-relaxed m-0 text-ng-secondary bg-ng-elevated p-4 rounded-xl border border-ng-border shadow-inner">
              Are you sure you want to execute{" "}
              <strong className={`font-mono px-1.5 py-0.5 rounded ${actionGate.action === "lockdown" ? "text-red-500 bg-red-500/10 border border-red-500/20" : "text-amber-500 bg-amber-500/10 border border-amber-500/20"}`}>
                {actionGate.action.toUpperCase()}
              </strong>{" "}
              command for <strong className="text-ng-text font-display">{actionGate.gate.name}</strong>? All hardware controllers will log this operator command with your cryptographic signature.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-ng-border mt-1">
              <button
                onClick={() => setActionGate(null)}
                className="px-6 py-2.5 rounded-xl font-display font-medium text-sm border cursor-pointer bg-ng-elevated border-ng-border text-ng-text hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActionConfirm}
                className={`px-6 py-2.5 rounded-xl font-display font-semibold text-sm text-white border-none cursor-pointer transition-all hover:brightness-110 shadow-[0_0_15px_rgba(0,0,0,0.2)] ${
                  actionGate.action === "lockdown" ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "bg-ng-orange shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                }`}
              >
                Execute Command
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
