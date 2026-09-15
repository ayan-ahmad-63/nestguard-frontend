import type { StatusType, AccessLog } from "../types";

export const GATES = [
  { name: "Main Gate", status: "safe" as StatusType },
  { name: "Block A", status: "attention" as StatusType },
  { name: "Block B", status: "safe" as StatusType },
  { name: "Block C", status: "safe" as StatusType },
  { name: "Service Entry", status: "critical" as StatusType },
  { name: "Rear Exit", status: "safe" as StatusType },
];

export const INITIAL_LOGS = [
  { id: "L1", initials: "RS", name: "Rahul Sharma", gate: "Main Gate", method: "Fingerprint", time: "09:41:02", status: "safe" as StatusType, roll: "BSE-2022-041", confidence: 99.4 },
  { id: "L2", initials: "PK", name: "Priya Kapoor", gate: "Block A", method: "Card", time: "09:38:17", status: "safe" as StatusType, roll: "BSE-2022-119", confidence: 100 },
  { id: "L3", initials: "AM", name: "Arun Mehta", gate: "Block B", method: "Fingerprint", time: "09:35:44", status: "safe" as StatusType, roll: "BSE-2021-088", confidence: 98.7 },
  { id: "L4", initials: "VT", name: "Visitor · Teja", gate: "Main Gate", method: "Manual", time: "09:31:08", status: "attention" as StatusType, roll: "VIS-9912", confidence: 92.0 },
  { id: "L5", initials: "SK", name: "Suresh Kumar", gate: "Service Entry", method: "Fingerprint", time: "09:27:55", status: "critical" as StatusType, roll: "BSE-2023-014", confidence: 87.2 },
  { id: "L6", initials: "NR", name: "Nisha Reddy", gate: "Block A", method: "Card", time: "09:24:33", status: "safe" as StatusType, roll: "BSE-2022-054", confidence: 100 },
  { id: "L7", initials: "DM", name: "Dev Mishra", gate: "Block C", method: "Fingerprint", time: "09:20:11", status: "safe" as StatusType, roll: "BSE-2021-177", confidence: 99.1 },
];

export const INITIAL_VISITORS = [
  { id: 1, name: "Ravi Teja", host: "Rahul Sharma", since: "09:25", status: "pending" as const },
  { id: 2, name: "Anjali Singh", host: "Priya Kapoor", since: "09:10", status: "approved" as const },
  { id: 3, name: "Kumar Patel", host: "Dev Mishra", since: "08:55", status: "pending" as const },
];

export const INITIAL_ALERTS = [
  { id: 101, msg: "Unauthorized attempt — Service Entry", time: "09:27", sev: "critical" as const },
  { id: 102, msg: "Block A held open >30s", time: "09:22", sev: "attention" as const },
  { id: 103, msg: "Device offline — Block C reader", time: "08:55", sev: "attention" as const },
];

export const ALL_LOGS: AccessLog[] = [
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
