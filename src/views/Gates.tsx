import { useEffect, useMemo, useState } from "react";
import StatusPill from "../components/ui/StatusPill";
import type { StatusType } from "../types";
import { useAppContext } from "../components/providers/AppProvider";
import { apiFetch } from "../lib/api";

interface GateRow {
  id: string;
  name: string;
  location: string;
  status: StatusType;
}

/**
 * Gates are verify-and-log: the Live20R reader shows VERIFIED / REJECTED to Security and the
 * guard opens the door by hand. There is nothing to lock or unlock from here, so this page
 * only shows what the system actually knows: the gate list, the live connection, and recent scans.
 */
export default function Gates() {
  const { wsConnected, liveLogs } = useAppContext();
  const [gates, setGates] = useState<GateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/api/v1/gates", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (Array.isArray(json.data)) setGates(json.data);
        else setFailed(true);
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const byGate: Record<string, { count: number; rejected: number; last?: (typeof liveLogs)[number] }> = {};
    for (const log of liveLogs) {
      const g = (byGate[log.gate] ||= { count: 0, rejected: 0 });
      g.count += 1;
      if (log.status === "critical") g.rejected += 1;
      if (!g.last) g.last = log; // liveLogs is newest first
    }
    return byGate;
  }, [liveLogs]);

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="flex items-center gap-3 text-xs font-mono text-ng-secondary">
        <span className={`inline-block w-2 h-2 rounded-full ${wsConnected ? "bg-green-500" : "bg-red-500"}`} />
        {wsConnected ? "Live connection to the server is up" : "Live connection is down: scans will not appear until it returns"}
      </div>

      {loading && <p className="text-sm text-ng-muted font-mono">Loading gates…</p>}
      {failed && !loading && (
        <p className="text-sm text-red-400 font-mono">Could not load gates from the server. Check that the API is running and you are signed in.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gates.map((gate) => {
          const s = stats[gate.name];
          return (
            <div key={gate.id} className="rounded-[2rem] border border-ng-border bg-ng-panel shadow-xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border bg-ng-elevated border-ng-border text-ng-secondary">⛩</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate font-display text-ng-text">{gate.name}</div>
                  <div className="text-[11px] font-mono text-ng-muted truncate">{gate.location || "Main entrance"}</div>
                </div>
                <StatusPill status={gate.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <Cell label="Reader" value="ZKTeco Live20R (USB)" />
                <Cell label="Door" value="Opened by the guard" />
                <Cell label="Scans in feed" value={String(s?.count ?? 0)} />
                <Cell label="Rejected" value={String(s?.rejected ?? 0)} warn={(s?.rejected ?? 0) > 0} />
              </div>

              <div className="text-[11px] font-mono text-ng-secondary border-t border-ng-border pt-3">
                {s?.last ? (
                  <>Last scan: <span className="text-ng-text">{s.last.name}</span> · {s.last.dir} · {s.last.time}</>
                ) : (
                  "No scans yet since this page was opened."
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Cell({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="p-3 rounded-xl border bg-ng-elevated/40 border-ng-border flex flex-col gap-1">
      <span className="uppercase tracking-widest text-ng-muted text-[10px]">{label}</span>
      <span className={warn ? "text-red-400 font-bold" : "text-ng-text font-semibold"}>{value}</span>
    </div>
  );
}
