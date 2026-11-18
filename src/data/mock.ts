import type { StatusType, AccessLog, AlertItem } from "../types";

export const GATES = [
  { name: "Main Gate Entry", status: "safe" as StatusType },
  { name: "Main Gate Exit", status: "safe" as StatusType },
];

export interface MockVisitor {
  id: number;
  name: string;
  host: string;
  since: string;
  status: "pending" | "approved" | "rejected";
}

export const INITIAL_LOGS: AccessLog[] = [];

export const INITIAL_VISITORS: MockVisitor[] = [];

export const INITIAL_ALERTS: AlertItem[] = [];

export const ALL_LOGS: AccessLog[] = [];
