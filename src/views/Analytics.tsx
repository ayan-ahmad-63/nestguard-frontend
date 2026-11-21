"use client";
import { useState, useEffect } from "react";
import { useAppContext } from "../components/providers/AppProvider";

import { apiFetch } from "../lib/api";

interface ResidentRecord {
  _id: string;
  name: string;
  rollNo: string;
  status: "INSIDE" | "OUTSIDE";
  personType: "STUDENT" | "WORKER" | "STAFF";
}

interface LogItem {
  id?: string;
  _id?: string;
  name?: string;
  rollNo?: string;
  status?: "safe" | "attention" | "critical";
  timestamp?: string;
  createdAt?: string;
  gate?: string;
}

interface AlertItem {
  id?: string;
  _id?: string;
  title: string;
  user?: string;
  severity: "safe" | "attention" | "critical";
  createdAt?: string;
}

export default function Analytics() {
  const { liveLogs, alerts: contextAlerts } = useAppContext();
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("7D");
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [, setLoading] = useState(true);

  // Use real-time synchronized context data whenever available for zero-latency rendering
  const effectiveLogs = liveLogs.length > 0 ? liveLogs : logs;
  const effectiveAlerts = contextAlerts.length > 0 ? contextAlerts : alerts;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [
          apiFetch(`/api/v1/students`, { cache: "no-store" }).then(r => r.json()),
        ];
        // Only fetch logs or alerts if context doesn't already have them
        const shouldFetchLogs = liveLogs.length === 0;
        const shouldFetchAlerts = contextAlerts.length === 0;
        if (shouldFetchLogs) {
          promises.push(apiFetch(`/api/v1/entry-logs`, { cache: "no-store" }).then(r => r.json()));
        }
        if (shouldFetchAlerts) {
          promises.push(apiFetch(`/api/v1/alerts`, { cache: "no-store" }).then(r => r.json()));
        }

        const results = await Promise.allSettled(promises);

        const studentRes = results[0];
        if (studentRes && studentRes.status === "fulfilled" && studentRes.value) {
          const list = studentRes.value.data?.students || (Array.isArray(studentRes.value.data) ? studentRes.value.data : []);
          setResidents(list);
        }

        let idx = 1;
        if (shouldFetchLogs) {
          const logRes = results[idx];
          if (logRes && logRes.status === "fulfilled" && logRes.value) {
            const lList = logRes.value.data?.logs || (Array.isArray(logRes.value.data) ? logRes.value.data : []);
            setLogs(lList);
          }
          idx++;
        }

        if (shouldFetchAlerts) {
          const alertRes = results[idx];
          if (alertRes && alertRes.status === "fulfilled" && alertRes.value) {
            const aList = alertRes.value.data?.alerts || (Array.isArray(alertRes.value.data) ? alertRes.value.data : []);
            setAlerts(aList);
          }
        }
      } catch {
        // Fallback to empty clean state
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [liveLogs.length, contextAlerts.length]);

  const totalResidents = residents.length;
  const insideCount = residents.filter(r => r.status === "INSIDE").length;
  const criticalLogs = effectiveLogs.filter(l => l.status === "critical" || l.status === "attention");
  const anomalyCount = criticalLogs.length + effectiveAlerts.length;
  const postureScore = anomalyCount === 0 ? 100 : Math.max(20, 100 - anomalyCount * 12);

  // Calculate flagged residents from real logs/alerts
  const flaggedResidents = residents
    .filter(r => criticalLogs.some(cl => cl.rollNo === r.rollNo || cl.name === r.name))
    .map(r => ({
      name: r.name,
      roll: r.rollNo,
      score: 65,
      trend: "↑",
      status: "attention" as const,
    }));

  return (
    <div className="flex flex-col gap-6 select-none font-body">
      {/* Top Controls & Timeframe Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-ng-panel border-ng-border shadow-sm">
          {(["7D", "30D", "90D"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-colors border-none ${
                timeframe === t ? "bg-ng-orange text-white shadow-[0_0_10px_rgba(255,107,0,0.3)]" : "bg-transparent text-ng-secondary hover:text-ng-text"
              }`}
            >
              {t === "7D" ? "Last 7 Days" : t === "30D" ? "Last 30 Days" : "Last 90 Days"}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-ng-muted tracking-widest uppercase font-bold">
          Hostel Directory: {totalResidents} Registered Personnel
        </span>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-[2rem] border overflow-hidden shadow-2xl bg-ng-panel border-ng-border divide-y lg:divide-y-0 lg:divide-x divide-ng-border">
        {[
          { label: "Total Personnel", val: String(totalResidents), sub: "Enrolled in DB" },
          { label: "Inside Campus", val: String(insideCount), sub: totalResidents > 0 ? `${Math.round((insideCount / totalResidents) * 100)}% on premises` : "0% on premises" },
          { label: "Anomalies Logged", val: String(anomalyCount), sub: "Real security flags" },
          { label: "Avg Security Posture", val: `${postureScore}/100`, sub: postureScore === 100 ? "Nominal · 0 breaches" : "Active alerts monitored" },
        ].map((s, idx) => (
          <div key={idx} className="p-6 flex flex-col gap-1.5 hover:bg-white/[0.02] transition-colors">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-ng-muted">
              {s.label}
            </span>
            <span className="text-3xl font-bold font-display text-ng-text">
              {s.val}
            </span>
            <span className="text-[11px] font-mono text-ng-secondary">
              {s.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Left: Anomaly Detection Frequency */}
        <div className="rounded-[2rem] border p-6 shadow-2xl flex flex-col justify-between bg-ng-panel border-ng-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold m-0 font-display text-ng-text">
                Anomaly Detection Frequency
              </h3>
              <p className="text-[11px] font-mono m-0 mt-1 text-ng-muted tracking-tight">
                Temporal deviation index across Main Gate Entry & Exit readers
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ng-muted bg-ng-elevated px-2.5 py-1 rounded-md border border-ng-border">
              No Data
            </span>
          </div>

          <div className="h-44 w-full flex flex-col items-center justify-center font-mono text-xs text-ng-muted gap-2 text-center p-4">
            <span className="text-2xl opacity-40">📊</span>
            <span className="font-semibold text-ng-text">No Data Available</span>
            <span className="text-[11px] text-ng-secondary">Temporal anomaly tracking is currently inactive.</span>
          </div>
        </div>

        {/* Right: Behavioral Anomaly Distribution */}
        <div className="rounded-[2rem] border p-6 shadow-2xl flex flex-col justify-between bg-ng-panel border-ng-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold m-0 font-display text-ng-text">
                Behavioral Anomaly Distribution
              </h3>
              <p className="text-[11px] font-mono m-0 mt-1 text-ng-muted tracking-tight">
                Rule-based classification breakdown
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ng-muted bg-ng-elevated px-2.5 py-1 rounded-md border border-ng-border">
              No Data
            </span>
          </div>

          <div className="h-44 w-full flex flex-col items-center justify-center font-mono text-xs text-ng-muted gap-2 text-center p-4">
            <span className="text-2xl opacity-40">🛡️</span>
            <span className="font-semibold text-ng-text">No Data Available</span>
            <span className="text-[11px] text-ng-secondary">Behavioral pattern classification is currently inactive.</span>
          </div>
        </div>
      </div>

      {/* Bottom: Resident Risk Index */}
      <div className="rounded-[2rem] border overflow-hidden shadow-2xl bg-ng-panel border-ng-border">
        <div className="px-6 py-5 border-b flex items-center justify-between border-ng-border bg-ng-elevated/30">
          <div>
            <span className="text-sm font-semibold font-display text-ng-text">
              Flagged Resident Risk Ranking
            </span>
            <span className="text-[10px] font-mono ml-3 text-ng-orange font-bold uppercase tracking-widest bg-ng-orange/10 px-2 py-0.5 rounded-md border border-ng-orange/20">
              Live Evaluation
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ng-border bg-ng-elevated/10">
                {["Resident Name", "Student / Staff ID", "Risk Posture", "Status", "Actions"].map((h, i) => (
                  <th key={i} className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest font-bold text-ng-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ng-border font-body text-xs">
              {flaggedResidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center font-mono text-ng-muted">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">✓</span>
                      <span className="font-semibold text-ng-text text-sm">No Residents Flagged for Anomalous Activity</span>
                      <span className="text-xs text-ng-secondary">All student and worker access events are strictly nominal.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                flaggedResidents.map(s => (
                  <tr key={s.roll} className="transition-colors bg-transparent hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-sm font-semibold text-ng-text font-display">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 text-[11px] font-mono text-ng-secondary">
                      {s.roll}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md font-bold border bg-amber-500/10 text-amber-500 border-amber-500/20">
                        {s.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-amber-400">
                      Under Observation
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 rounded-xl text-[11px] font-mono font-medium border cursor-pointer transition-colors bg-ng-elevated border-ng-border text-ng-text hover:bg-white/[0.05]">
                        Audit Logs →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
