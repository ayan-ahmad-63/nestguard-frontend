import { useState } from "react";
import StatusPill from "../components/ui/StatusPill";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import { exportToCSV } from "../lib/utils";
import type { AccessLog } from "../types";

const ALL_LOGS: AccessLog[] = [
  { id: "LOG-1001", initials: "RS", name: "Rahul Sharma", rollNo: "BSE-2022-041", gate: "Main Gate", dir: "entry", method: "Fingerprint", time: "2026-03-14 09:41:02", status: "safe", confidence: 99.4 },
  { id: "LOG-1002", initials: "PK", name: "Priya Kapoor", rollNo: "BSE-2022-119", gate: "Block A", dir: "entry", method: "Card", time: "2026-03-14 09:38:17", status: "safe", confidence: 100 },
  { id: "LOG-1003", initials: "AM", name: "Arun Mehta", rollNo: "BSE-2021-088", gate: "Block B", dir: "entry", method: "Fingerprint", time: "2026-03-14 09:35:44", status: "safe", confidence: 98.7 },
  { id: "LOG-1004", initials: "VT", name: "Visitor · Teja", rollNo: "VIS-9912", gate: "Main Gate", dir: "entry", method: "Manual", time: "2026-03-14 09:31:08", status: "attention", confidence: 92.0 },
  { id: "LOG-1005", initials: "SK", name: "Suresh Kumar", rollNo: "BSE-2023-014", gate: "Service Entry", dir: "entry", method: "Fingerprint", time: "2026-03-14 09:27:55", status: "critical", confidence: 87.2 },
  { id: "LOG-1006", initials: "NR", name: "Nisha Reddy", rollNo: "BSE-2022-054", gate: "Block A", dir: "exit", method: "Card", time: "2026-03-14 09:24:33", status: "safe", confidence: 100 },
  { id: "LOG-1007", initials: "DM", name: "Dev Mishra", rollNo: "BSE-2021-177", gate: "Block C", dir: "entry", method: "Fingerprint", time: "2026-03-14 09:20:11", status: "safe", confidence: 99.1 },
  { id: "LOG-1008", initials: "KP", name: "Kavya Pillai", rollNo: "BSE-2023-082", gate: "Main Gate", dir: "exit", method: "Fingerprint", time: "2026-03-14 09:15:40", status: "safe", confidence: 97.9 },
  { id: "LOG-1009", initials: "RL", name: "Rohan Lal", rollNo: "BSE-2022-099", gate: "Rear Exit", dir: "exit", method: "Card", time: "2026-03-14 09:10:22", status: "safe", confidence: 100 },
  { id: "LOG-1010", initials: "MJ", name: "Meena Joshi", rollNo: "BSE-2021-012", gate: "Block B", dir: "entry", method: "Fingerprint", time: "2026-03-14 08:58:07", status: "safe", confidence: 98.4 },
  { id: "LOG-1011", initials: "AT", name: "Unknown Person", rollNo: "UNREG-99", gate: "Service Entry", dir: "entry", method: "None", time: "2026-03-14 08:45:30", status: "critical", confidence: 14.2 },
  { id: "LOG-1012", initials: "SN", name: "Suraj Nair", rollNo: "BSE-2022-140", gate: "Block A", dir: "entry", method: "Fingerprint", time: "2026-03-14 08:30:15", status: "safe", confidence: 99.3 },
];

const METHODS = ["All", "Fingerprint", "Card", "Manual", "None"];
const STATUSES = ["All", "Safe", "Attention", "Critical"];

export default function AccessLogs() {
  const [logs] = useState(ALL_LOGS);
  const [method, setMethod] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);

  const filtered = logs.filter(l => {
    if (method !== "All" && l.method !== method) return false;
    if (status !== "All" && l.status !== status.toLowerCase()) return false;
    if (
      search &&
      !l.name.toLowerCase().includes(search.toLowerCase()) &&
      !l.gate.toLowerCase().includes(search.toLowerCase()) &&
      !(l.rollNo && l.rollNo.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleExport = () => {
    exportToCSV("nestguard-access-logs", filtered);
  };

  return (
    <div className="rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl select-none bg-ng-panel">
      {/* Filter and Tool Bar */}
      <div className="p-5 border-b border-ng-border flex flex-wrap gap-4 items-center justify-between bg-ng-elevated/30">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-ng-border text-xs w-48 sm:w-64 bg-ng-elevated transition-colors focus-within:border-ng-orange focus-within:shadow-[0_0_10px_rgba(255,107,0,0.15)]">
            <span className="text-ng-muted">⌕</span>
            <input
              placeholder="Filter by name, roll no, gate…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs font-body text-ng-text placeholder-ng-muted"
            />
          </div>

          {/* Methods */}
          <div className="flex items-center gap-1 bg-ng-elevated p-1 rounded-xl border border-ng-border">
            {METHODS.map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-colors border-none ${
                  method === m ? "bg-ng-orange/15 text-ng-orange" : "bg-transparent text-ng-muted hover:text-ng-text"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Statuses */}
          <div className="flex items-center gap-1 bg-ng-elevated p-1 rounded-xl border border-ng-border">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-colors border-none ${
                  status === s ? "bg-ng-orange/15 text-ng-orange" : "bg-transparent text-ng-muted hover:text-ng-text"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Action Right */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-ng-muted">
            {filtered.length} matching events
          </span>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-colors flex items-center gap-2 bg-ng-elevated border-ng-border text-ng-text hover:bg-white/[0.05]"
          >
            <span>↓</span> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ng-border bg-ng-elevated/20">
              {["User / Resident", "Gate", "Direction", "Method", "Timestamp", "Status", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    className="px-6 py-4 text-[10px] font-mono uppercase font-bold tracking-widest text-ng-muted"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ng-border">
            {filtered.map(row => (
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
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                      row.dir === "entry" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    }`}
                  >
                    {row.dir === "entry" ? "↙ ENTRY" : "↗ EXIT"}
                  </span>
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
                <td className="px-6 py-4 text-right text-xs font-mono text-ng-muted hover:text-ng-orange transition-colors font-medium">
                  Details →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record · ${selectedLog.id}`}
          subtitle={`Cryptographic verification audit for ${selectedLog.name}`}
        >
          <div className="flex flex-col gap-5 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border flex flex-col gap-1.5 bg-ng-elevated border-ng-border shadow-inner">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-ng-muted">
                  Resident
                </span>
                <span className="font-semibold text-base font-display text-ng-text">
                  {selectedLog.name}
                </span>
                <span className="font-mono text-xs text-ng-secondary">
                  ID: {selectedLog.rollNo}
                </span>
              </div>
              <div className="p-4 rounded-xl border flex flex-col gap-1.5 bg-ng-elevated border-ng-border shadow-inner">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-ng-muted">
                  Location & Time
                </span>
                <span className="font-semibold text-base font-display text-ng-text">
                  {selectedLog.gate} ({selectedLog.dir.toUpperCase()})
                </span>
                <span className="font-mono text-xs text-ng-secondary">
                  {selectedLog.time}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl border font-mono space-y-3 bg-ng-elevated border-ng-border shadow-inner text-xs">
              <div className="flex justify-between items-center border-b border-ng-border/50 pb-2">
                <span className="text-ng-muted">Verification Method:</span>
                <span className="text-ng-text font-semibold">{selectedLog.method}</span>
              </div>
              <div className="flex justify-between items-center border-b border-ng-border/50 pb-2">
                <span className="text-ng-muted">Biometric Confidence:</span>
                <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 font-bold">{selectedLog.confidence}% Match</span>
              </div>
              <div className="flex justify-between items-center border-b border-ng-border/50 pb-2">
                <span className="text-ng-muted">Cryptographic Digest:</span>
                <span className="text-ng-secondary">sha256:d8a2...3f1c</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ng-muted">Controller Terminal:</span>
                <span className="text-ng-secondary bg-ng-bg px-2 py-0.5 rounded">TERM-{selectedLog.gate.replace(/\s+/g, "").toUpperCase()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-ng-border mt-1">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2.5 rounded-xl font-display font-medium text-sm border cursor-pointer bg-ng-elevated border-ng-border text-ng-text hover:bg-white/[0.05] transition-colors"
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
