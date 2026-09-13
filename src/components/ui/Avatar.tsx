import { C, F } from "../../lib/constants";
import type { StatusType } from "../../types";

interface AvatarProps {
  initials: string;
  status?: StatusType;
  size?: number;
  className?: string;
}

export default function Avatar({ initials, status = "safe", size = 32, className = "" }: AvatarProps) {
  const colorMap: Record<StatusType, string> = {
    safe: C.blue,
    attention: C.amber,
    critical: C.red,
    offline: C.muted,
  };

  const color = colorMap[status];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-bold select-none shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `${color}22`,
        border: `1.5px solid ${color}`,
        color,
        fontFamily: F.heading,
        fontSize: Math.max(10, Math.round(size * 0.38)),
      }}
    >
      {initials}
    </div>
  );
}
