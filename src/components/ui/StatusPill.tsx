import { C } from "../../lib/constants";
import type { StatusType } from "../../types";

const statusMap: Record<StatusType, { dot: string; label: string; glow: string }> = {
  safe: { dot: C.green, label: "Locked", glow: "rgba(63, 208, 104, 0.45)" },
  attention: { dot: C.amber, label: "Open", glow: "rgba(224, 167, 46, 0.45)" },
  critical: { dot: C.red, label: "Fault", glow: "rgba(255, 90, 80, 0.45)" },
  offline: { dot: C.muted, label: "Offline", glow: "transparent" },
};

interface Props {
  status: StatusType;
  label?: string;
  pulse?: boolean;
}

export default function StatusPill({ status, label, pulse = true }: Props) {
  const { dot, label: defaultLabel, glow } = statusMap[status] ?? statusMap.safe;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 border select-none font-mono text-[11px]"
      style={{
        color: C.secondary,
        background: C.elevated,
        borderColor: C.border,
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0 relative"
        style={{
          background: dot,
          boxShadow: `0 0 6px ${glow}`,
        }}
      >
        {pulse && status !== "offline" && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-60"
            style={{ background: dot }}
          />
        )}
      </span>
      {label ?? defaultLabel}
    </span>
  );
}
