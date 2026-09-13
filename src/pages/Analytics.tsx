"use client";
import { useState } from "react";

// Simple SVG Line Chart Component
function SimpleLineChart({ data }: { data: { date: string; anomalies: number }[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.anomalies), 10);
  const padding = { top: 20, bottom: 20, left: 30, right: 20 };
  const width = 600;
  const height = 180;
  
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  const getX = (i: number) => padding.left + (i / Math.max(1, data.length - 1)) * drawWidth;
  const getY = (val: number) => padding.top + drawHeight - (val / maxVal) * drawHeight;

  const points = data.map((d, i) => `${getX(i)},${getY(d.anomalies)}`).join(" ");

  return (
    <div className="relative w-full h-full flex flex-col justify-end">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Y Axis Grid Lines */}
        {[0, 0.5, 1].map(ratio => {
          const y = padding.top + drawHeight * ratio;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--color-ng-border)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="11" fontFamily="Space Mono" fill="var(--color-ng-muted)">
                {val}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={height - 2} textAnchor="middle" fontSize="11" fontFamily="Space Mono" fill="var(--color-ng-muted)">
            {d.date}
          </text>
        ))}

        {/* Line */}
        <polyline points={points} fill="none" stroke="var(--color-ng-blue)" strokeWidth="2.5" className="drop-shadow-[0_4px_6px_rgba(59,130,246,0.5)]" />

        {/* Data Points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(d.anomalies)}
            r={hoverIdx === i ? 6 : 4}
            fill="var(--color-ng-blue)"
            className="transition-all cursor-pointer"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && data[hoverIdx] && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 z-10"
          style={{
            left: `${(getX(hoverIdx) / width) * 100}%`,
            top: `${(getY(data[hoverIdx].anomalies) / height) * 100}%`,
          }}
        >
          <div className="px-4 py-2 rounded-xl border shadow-xl text-xs font-mono whitespace-nowrap bg-ng-elevated border-ng-border text-ng-text">
            <div className="text-ng-muted">{data[hoverIdx].date}</div>
            <div className="font-bold text-blue-500">Anomalies: {data[hoverIdx].anomalies}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const TIMEFRAME_DATA: Record<string, { trend: { date: string; anomalies: number }[]; stats: Record<string, string> }> = {
  "7D": {
    trend: [
      { date: "Mar 8", anomalies: 2 },
      { date: "Mar 9", anomalies: 1 },
      { date: "Mar 10", anomalies: 4 },
      { date: "Mar 11", anomalies: 2 },
      { date: "Mar 12", anomalies: 7 },
      { date: "Mar 13", anomalies: 3 },
      { date: "Mar 14", anomalies: 5 },
    ],
    stats: {
      anomalies: "5",
      occupancy: "217",
      riskScore: "34",
    },
  },
  "30D": {
    trend: [
      { date: "Wk 1", anomalies: 14 },
      { date: "Wk 2", anomalies: 9 },
      { date: "Wk 3", anomalies: 22 },
      { date: "Wk 4", anomalies: 16 },
    ],
    stats: {
      anomalies: "61",
      occupancy: "224",
      riskScore: "41",
    },
  },
  "90D": {
    trend: [
      { date: "Jan", anomalies: 45 },
      { date: "Feb", anomalies: 38 },
      { date: "Mar", anomalies: 61 },
    ],
    stats: {
      anomalies: "144",
      occupancy: "217",
      riskScore: "38",
    },
  },
};

const BEHAVIOR = [
  { label: "Late-night access attempt", value: 82, color: "#ef4444" },
  { label: "Rapid consecutive re-entry", value: 47, color: "#f59e0b" },
  { label: "Tailgating barrier violation", value: 31, color: "var(--color-ng-orange)" },
  { label: "Credential sharing indication", value: 18, color: "var(--color-ng-blue)" },
  { label: "High-frequency scanner retries", value: 63, color: "#f59e0b" },
];

const STUDENTS = [
  { name: "Suresh Kumar", roll: "BSE-2023-014", score: 78, trend: "↑", status: "critical" },
  { name: "Rohan Lal", roll: "BSE-2022-099", score: 62, trend: "↑", status: "attention" },
  { name: "Dev Mishra", roll: "BSE-2021-177", score: 41, trend: "↓", status: "safe" },
  { name: "Kavya Pillai", roll: "BSE-2023-082", score: 23, trend: "↓", status: "safe" },
  { name: "Arun Mehta", roll: "BSE-2021-088", score: 15, trend: "→", status: "safe" },
];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("7D");
  const data = TIMEFRAME_DATA[timeframe];

  return (
    <div className="flex flex-col gap-6 select-none">
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
          Hostel Capacity: 248 Total Residents
        </span>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-[2rem] border overflow-hidden shadow-2xl bg-ng-panel border-ng-border divide-y lg:divide-y-0 lg:divide-x divide-ng-border">
        {[
          { label: "Total Residents", val: "248", sub: "100% capacity" },
          { label: "Inside Campus", val: data.stats.occupancy, sub: "87.5% present" },
          { label: "Anomalies Logged", val: data.stats.anomalies, sub: "AI flagged events" },
          { label: "Avg Security Posture", val: `${data.stats.riskScore}/100`, sub: "Nominal safety score" },
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
        {/* Left: Trend Line Chart */}
        <div className="rounded-[2rem] border p-6 shadow-2xl flex flex-col justify-between bg-ng-panel border-ng-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-sm font-semibold m-0 font-display text-ng-text">
                Anomaly Detection Frequency
              </h3>
              <p className="text-[11px] font-mono m-0 mt-1 text-ng-muted tracking-tight">
                Temporal deviation index across all gateway readers
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-blue-500 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.2)]">
              ● Anomalies
            </span>
          </div>

          <div className="h-52 w-full relative z-10">
            <SimpleLineChart data={data.trend} />
          </div>
        </div>

        {/* Right: Behavioral Risk Breakdown */}
        <div className="rounded-[2rem] border p-6 shadow-2xl flex flex-col gap-5 bg-ng-panel border-ng-border">
          <div>
            <h3 className="text-sm font-semibold m-0 font-display text-ng-text">
              Behavioral Anomaly Distribution
            </h3>
            <p className="text-[11px] font-mono m-0 mt-1 text-ng-muted tracking-tight">
              AI classification breakdown of flagged attempts
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {BEHAVIOR.map(b => (
              <div key={b.label} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-ng-secondary">{b.label}</span>
                  <span className="font-bold" style={{ color: b.color }}>
                    {b.value}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-ng-bg shadow-inner border border-white/[0.02]">
                  <div className="h-full rounded-full shadow-[0_0_10px_currentColor]" style={{ width: `${b.value}%`, background: b.color, color: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Student Risk Index */}
      <div className="rounded-[2rem] border overflow-hidden shadow-2xl bg-ng-panel border-ng-border">
        <div className="px-6 py-5 border-b flex items-center justify-between border-ng-border bg-ng-elevated/30">
          <div>
            <span className="text-sm font-semibold font-display text-ng-text">
              Flagged Resident Risk Ranking
            </span>
            <span className="text-[10px] font-mono ml-3 text-ng-orange font-bold uppercase tracking-widest bg-ng-orange/10 px-2 py-0.5 rounded-md border border-ng-orange/20">
              Scores &gt; 35 require attention
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ng-border bg-ng-elevated/10">
                {["Resident Name", "Student Roll No", "Risk Posture", "30-Day Trend", "Recommended Action"].map((h, i) => (
                  <th key={i} className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest font-bold text-ng-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ng-border">
              {STUDENTS.map(s => (
                <tr key={s.name} className="transition-colors bg-transparent hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-sm font-semibold text-ng-text font-display">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-[11px] font-mono text-ng-secondary">
                    {s.roll}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md font-bold border ${
                        s.status === "critical" ? "bg-red-500/10 text-red-500 border-red-500/20" : s.status === "attention" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
                      }`}
                    >
                      {s.score}/100
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-mono text-xs font-bold ${s.trend === "↑" ? "text-red-500" : "text-green-500"}`}>
                    {s.trend} {s.trend === "↑" ? "Escalating" : "Decreasing"}
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-4 py-2 rounded-xl text-[11px] font-mono font-medium border cursor-pointer transition-colors bg-ng-elevated border-ng-border text-ng-text hover:bg-white/[0.05]">
                      Audit Profile →
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
