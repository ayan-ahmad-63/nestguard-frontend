import { useState } from "react";
import StatusPill from "../components/ui/StatusPill";
import type { DeviceItem, StatusType } from "../types";

const INITIAL_DEVICES: DeviceItem[] = [
  { id: "DEV-001", name: "Main Gate Biometric Reader", type: "Fingerprint", battery: 92, signal: 80, lastSeen: "09:41:02", status: "safe" },
  { id: "DEV-002", name: "Block A Primary Scanner", type: "Fingerprint", battery: 67, signal: 55, lastSeen: "09:38:17", status: "attention" },
  { id: "DEV-003", name: "Block A RFID Access Pad", type: "Card", battery: 88, signal: 72, lastSeen: "09:35:44", status: "safe" },
  { id: "DEV-004", name: "Block B Biometric Scanner", type: "Fingerprint", battery: 88, signal: 72, lastSeen: "09:35:44", status: "safe" },
  { id: "DEV-005", name: "Block C Optical Unit", type: "Fingerprint", battery: 74, signal: 40, lastSeen: "08:54:18", status: "attention" },
  { id: "DEV-006", name: "Service Entry Heavy-Duty Reader", type: "Fingerprint", battery: 23, signal: 28, lastSeen: "09:27:55", status: "critical" },
  { id: "DEV-007", name: "Rear Exit Turnstile Scanner", type: "Card", battery: 81, signal: 77, lastSeen: "09:15:40", status: "safe" },
  { id: "DEV-008", name: "Main Gate Bullet Camera 4K", type: "Camera", battery: 100, signal: 90, lastSeen: "09:41:10", status: "safe" },
  { id: "DEV-009", name: "Block A Vestibule Dome IP", type: "Camera", battery: 100, signal: 85, lastSeen: "09:40:55", status: "safe" },
  { id: "DEV-010", name: "Service Entry Logistics PTZ", type: "Camera", battery: 100, signal: 55, lastSeen: "09:27:50", status: "attention" },
];

function TelemetryBar({ value }: { value: number }) {
  const colorClass = value > 65 ? "bg-green-500" : value > 35 ? "bg-amber-500" : "bg-red-500";
  const shadowClass = value > 65 ? "shadow-[0_0_8px_rgba(34,197,94,0.5)]" : value > 35 ? "shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  
  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <span className="text-ng-secondary w-8 font-bold">{value}%</span>
      <div className="w-16 h-2 rounded-full overflow-hidden bg-ng-bg shadow-inner border border-white/[0.02]">
        <div className={`h-full rounded-full ${colorClass} ${shadowClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function DeviceHealth() {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [typeFilter, setTypeFilter] = useState("All");
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagResult, setDiagResult] = useState<string | null>(null);

  const runSystemDiagnostic = () => {
    setRunningDiagnostic(true);
    setDiagResult(null);

    setTimeout(() => {
      setRunningDiagnostic(false);
      setDiagResult("✓ Full hardware poll complete: 10/10 responded. 1 low battery, 1 weak wireless signal detected.");
      // Refresh last seen
      const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      setDevices(prev => prev.map(d => ({ ...d, lastSeen: now })));
    }, 1200);
  };

  const handleRebootDevice = (id: string) => {
    setDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, status: "safe" as StatusType } : d)),
    );
    setDiagResult(`Device ${id} power-cycled and re-synchronized.`);
    setTimeout(() => setDiagResult(null), 3500);
  };

  const filtered = devices.filter(d => {
    if (typeFilter === "All") return true;
    return d.type === typeFilter;
  });

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Top Filter and Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-ng-panel border border-ng-border">
          {["All", "Fingerprint", "Card", "Camera"].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors border-none ${
                typeFilter === t ? "bg-ng-orange text-white shadow-[0_0_10px_rgba(255,107,0,0.3)]" : "bg-transparent text-ng-secondary hover:text-ng-text"
              }`}
            >
              {t === "All" ? "All Hardware" : t}
            </button>
          ))}
        </div>

        <button
          onClick={runSystemDiagnostic}
          disabled={runningDiagnostic}
          className={`px-5 py-2.5 rounded-xl text-xs font-display font-semibold border cursor-pointer transition-all flex items-center gap-2.5 ${
            runningDiagnostic 
              ? "bg-ng-elevated border-ng-border text-ng-secondary cursor-not-allowed" 
              : "bg-ng-orange/10 border-ng-orange/30 text-ng-orange hover:bg-ng-orange/20 shadow-[0_0_15px_rgba(255,107,0,0.1)]"
          }`}
        >
          {runningDiagnostic ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full animate-ping bg-ng-orange shrink-0" />
              <span>Polling Telemetry…</span>
            </>
          ) : (
            <>
              <span className="text-sm">⚡</span>
              <span>Run System Diagnostics</span>
            </>
          )}
        </button>
      </div>

      {diagResult && (
        <div className="p-4 rounded-xl border border-green-500/30 text-xs font-mono font-bold flex items-center justify-between animate-in fade-in duration-200 bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          {diagResult}
        </div>
      )}

      {/* Device Table */}
      <div className="rounded-[2rem] border overflow-hidden shadow-2xl bg-ng-panel border-ng-border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ng-border bg-ng-elevated/30">
                {["Hardware ID", "Device Name", "Category", "Power Level", "Signal RSSI", "Last Telemetry", "Status", "Actions"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-5 py-4 text-[10px] font-mono uppercase tracking-widest font-bold text-ng-muted"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ng-border">
              {filtered.map(d => (
                <tr
                  key={d.id}
                  className="transition-colors bg-transparent hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 text-xs font-mono text-ng-muted">
                    {d.id}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold font-display text-ng-text">
                    {d.name}
                  </td>
                  <td className="px-5 py-4 text-[11px] font-mono text-ng-secondary tracking-widest uppercase font-bold">
                    {d.type}
                  </td>
                  <td className="px-5 py-4">
                    <TelemetryBar value={d.battery} />
                  </td>
                  <td className="px-5 py-4">
                    <TelemetryBar value={d.signal} />
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-ng-muted">
                    {d.lastSeen}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={d.status} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleRebootDevice(d.id)}
                      className="px-4 py-2 rounded-xl text-xs font-mono font-medium border cursor-pointer transition-colors bg-ng-elevated border-ng-border text-ng-secondary hover:text-ng-orange hover:border-ng-orange/30 hover:bg-ng-orange/10"
                      title="Send hardware restart command"
                    >
                      Reboot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
