export type Page =
  | "dashboard"
  | "gates"
  | "logs"
  | "visitors"
  | "alerts"
  | "analytics"
  | "camera"
  | "devices";

export type StatusType = "safe" | "attention" | "critical" | "offline";

export interface GateDeviceTelemetry {
  label: string;
  value: string;
  bar: number | null;
  color: string | null;
}

export interface Gate {
  id: string;
  name: string;
  status: StatusType;
  location: string;
  devices: GateDeviceTelemetry[];
}

export interface AccessLog {
  id: string;
  initials: string;
  name: string;
  rollNo?: string;
  gate: string;
  dir: "entry" | "exit";
  method: "Fingerprint" | "Card" | "Manual" | "None";
  time: string;
  status: StatusType;
  confidence?: number;
}

export type VisitorStatus = "pending" | "approved" | "rejected" | "checked-in";

export interface Visitor {
  id: number;
  name: string;
  phone?: string;
  host: string;
  purpose: string;
  since: string;
  notif: string | null;
  status: VisitorStatus;
}

export type AlertSeverity = "critical" | "attention" | "safe";

export interface AlertItem {
  id: number;
  sev: AlertSeverity;
  time: string;
  title: string;
  detail: string;
  gate: string;
  user: string;
  acknowledged?: boolean;
}

export interface DeviceItem {
  id: string;
  name: string;
  type: "Fingerprint" | "Card" | "Camera";
  battery: number;
  signal: number;
  lastSeen: string;
  status: StatusType;
}

export interface CameraFeed {
  id: string;
  name: string;
  gateId: string;
  status: StatusType;
  time: string;
  imgUrl: string;
}
