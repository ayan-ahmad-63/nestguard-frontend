import type { Page } from "../types";

export type Role = "admin" | "warden" | "security";

export interface RoleConfig {
  role: Role;
  label: string;
  badge: string;
  allowedPages: Page[];
  allowedRoutes: string[];
  description: string;
}

export const ROLE_PERMISSIONS: Record<Role, RoleConfig> = {
  admin: {
    role: "admin",
    label: "Admin",
    badge: "Admin",
    allowedPages: ["dashboard", "enrollment", "gates", "logs", "visitors", "alerts", "analytics", "camera", "devices"],
    allowedRoutes: ["/dashboard", "/enrollment", "/gates", "/logs", "/visitors", "/alerts", "/analytics", "/camera", "/devices"],
    description: "Full system administration, hardware configuration, policy and user oversight.",
  },
  warden: {
    role: "warden",
    label: "Warden",
    badge: "Warden",
    allowedPages: ["dashboard", "enrollment", "logs", "visitors", "alerts", "analytics", "camera"],
    allowedRoutes: ["/dashboard", "/enrollment", "/logs", "/visitors", "/alerts", "/analytics", "/camera"],
    description: "Student welfare, curfew enforcement, disciplinary alerts, risk analytics, and leave/contractor approvals.",
  },
  security: {
    role: "security",
    label: "Security",
    badge: "Security",
    allowedPages: ["dashboard", "enrollment", "gates", "logs", "visitors", "camera", "devices"],
    allowedRoutes: ["/dashboard", "/enrollment", "/gates", "/logs", "/visitors", "/camera", "/devices"],
    description: "Physical gate operations, biometric enrollment, visitor check-in, and gate verification.",
  },
};

export function getRoleConfig(rawRole?: string | null): RoleConfig {
  if (!rawRole) {
    return {
      role: "admin",
      label: "",
      badge: "Console",
      allowedPages: ["dashboard", "enrollment", "gates", "logs", "visitors", "alerts", "analytics", "camera", "devices"],
      allowedRoutes: ["/dashboard", "/enrollment", "/gates", "/logs", "/visitors", "/alerts", "/analytics", "/camera", "/devices"],
      description: "",
    };
  }
  const normalized = rawRole.toLowerCase().trim() as Role;
  return ROLE_PERMISSIONS[normalized] || ROLE_PERMISSIONS.warden;
}

export function isPageAllowed(page: Page, rawRole?: string | null): boolean {
  const config = getRoleConfig(rawRole);
  return config.allowedPages.includes(page);
}

export function isRouteAllowed(pathname: string, rawRole?: string | null): boolean {
  const config = getRoleConfig(rawRole);
  return config.allowedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
