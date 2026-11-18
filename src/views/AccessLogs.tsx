import { useState } from "react";
import StatusPill from "../components/ui/StatusPill";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import { exportToCSV } from "../lib/utils";
import type { AccessLog } from "../types";
import { useAppContext } from "../components/providers/AppProvider";

const METHODS = ["All", "Fingerprint", "Card", "Manual", "None"];
const STATUSES = ["All", "Safe", "Attention", "Critical"];

export default function AccessLogs() {
  const { liveLogs } = useAppContext();
  // Deduplicate logs by unique ID
  const seenIds = new Set<string>();
  const logsList: AccessLog[] = liveLogs.filter((l) => {
    if (!l.id || seenIds.has(l.id)) return false;
    seenIds.add(l.id);
    return true;
  });
  const [method, setMethod] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const filtered = logsList.filter(l => {
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-transparent border-none outline-none w-full text-xs font-body text-ng-text placeholder-ng-muted"
            />
          </div>

          {/* Methods */}
          <div className="flex items-center gap-1 bg-ng-elevated p-1 rounded-xl border border-ng-border">
            {METHODS.map(m => (
              <button
                key={m}
                onClick={() => {
                  setMethod(m);
                  setPage(1);
                }}
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
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
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
            {paginatedLogs.map(row => (
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

      {/* Pagination Footer */}
      {filtered.length > PAGE_SIZE && (
        <div className="px-6 py-4 border-t border-ng-border flex items-center justify-between flex-wrap gap-3 bg-ng-elevated/20 text-xs font-mono">
          <span className="text-ng-muted">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} logs
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-ng-border bg-ng-elevated text-ng-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-all cursor-pointer font-bold"
            >
              ← Prev
            </button>
            <span className="px-2 text-ng-secondary font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-ng-border bg-ng-elevated text-ng-text disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.05] transition-all cursor-pointer font-bold"
            >
              Next →
            </button>
          </div>
        </div>
      )}

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
