/* ──────────────────────────────────────────────────────────────
   NestGuard 3D feature icons.
   One vocabulary across all six: a top-lit volumetric orange form
   (light→deep vertical gradient), a soft top-left highlight, dark
   negative-space detail, and a single grounding drop shadow.
   Deep-brown cutouts read on both light and dark card surfaces.
   ────────────────────────────────────────────────────────────── */

export type Icon3DName =
  | "biometric"
  | "monitoring"
  | "anomaly"
  | "visitor"
  | "emergency"
  | "analytics";

const CUT = "#2E1602";

const shapes: Record<Icon3DName, (g: string, h: string) => React.ReactNode> = {
  // Fingertip with ridges
  biometric: (g, h) => {
    const d =
      "M24 5.5C32.5 5.5 34.5 13 34.5 22C34.5 33.5 30 42.5 24 42.5C18 42.5 13.5 33.5 13.5 22C13.5 13 15.5 5.5 24 5.5Z";
    return (
      <>
        <path d={d} fill={g} />
        <path d={d} fill={h} />
        <g stroke={CUT} strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M17.5 22.5C17.5 15.5 30.5 15.5 30.5 22.5" />
          <path d="M17.8 27.5C17.8 20 30.2 20 30.2 27.5" />
          <path d="M18.5 32.5C18.5 25 29.5 25 29.5 32.5" />
          <path d="M21 36C21 31.5 27 31.5 27 36" />
        </g>
      </>
    );
  },
  // Eye
  monitoring: (g, h) => {
    const d =
      "M24 11.5C33 11.5 41 19 44.5 24C41 29 33 36.5 24 36.5C15 36.5 7 29 3.5 24C7 19 15 11.5 24 11.5Z";
    return (
      <>
        <path d={d} fill={g} />
        <path d={d} fill={h} />
        <circle cx="24" cy="24" r="7" fill={CUT} />
        <circle cx="21.4" cy="21.4" r="2.2" fill="#fff" opacity="0.85" />
      </>
    );
  },
  // Shield watching a pulse line
  anomaly: (g, h) => {
    const d =
      "M24 4.5L39.5 9.8V24C39.5 34.2 32.7 40.9 24 43.5C15.3 40.9 8.5 34.2 8.5 24V9.8L24 4.5Z";
    return (
      <>
        <path d={d} fill={g} />
        <path d={d} fill={h} />
        <path
          d="M13.5 25H19L21.5 18.5L26 31.5L28.5 25H34.5"
          stroke={CUT}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </>
    );
  },
  // Visitor ID badge
  visitor: (g, h) => (
    <>
      <rect x="20" y="4" width="8" height="6" rx="2" fill={g} />
      <rect x="11.5" y="8" width="25" height="34" rx="6" fill={g} />
      <rect x="11.5" y="8" width="25" height="34" rx="6" fill={h} />
      <circle cx="24" cy="20" r="4.6" fill={CUT} />
      <path d="M15.5 34.5C15.5 28.5 20 26 24 26C28 26 32.5 28.5 32.5 34.5Z" fill={CUT} />
    </>
  ),
  // Warning triangle
  emergency: (g, h) => {
    const d =
      "M24 6.5C25.4 6.5 26.7 7.25 27.5 8.6L42.2 34.2C43.7 36.8 41.9 40 38.9 40H9.1C6.1 40 4.3 36.8 5.8 34.2L20.5 8.6C21.3 7.25 22.6 6.5 24 6.5Z";
    return (
      <>
        <path d={d} fill={g} />
        <path d={d} fill={h} />
        <rect x="22.3" y="17" width="3.4" height="11" rx="1.7" fill={CUT} />
        <circle cx="24" cy="33" r="2" fill={CUT} />
      </>
    );
  },
  // Bar chart
  analytics: (g, h) => (
    <>
      {[
        { x: 9.5, y: 25, ht: 15 },
        { x: 20.25, y: 17, ht: 23 },
        { x: 31, y: 11, ht: 29 },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width="7.5" height={b.ht} rx="3.2" fill={g} />
          <rect x={b.x} y={b.y} width="7.5" height={b.ht} rx="3.2" fill={h} />
        </g>
      ))}
    </>
  ),
};

export default function Icon3D({
  name,
  size = 52,
  className = "",
}: {
  name: Icon3DName;
  size?: number;
  className?: string;
}) {
  const g = `${name}-g`;
  const h = `${name}-h`;
  const s = `${name}-s`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={g} x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFBB7C" />
          <stop offset="0.45" stopColor="#F2740E" />
          <stop offset="1" stopColor="#C4530A" />
        </linearGradient>
        <radialGradient id={h} cx="0.34" cy="0.26" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={s} x="-40%" y="-25%" width="180%" height="175%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.6" floodColor="#000" floodOpacity="0.38" />
        </filter>
      </defs>
      <g filter={`url(#${s})`}>{shapes[name](`url(#${g})`, `url(#${h})`)}</g>
    </svg>
  );
}
