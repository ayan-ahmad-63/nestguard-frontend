export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/** fetch() against the NestGuard API with the staff JWT attached. `path` starts with /api/v1/... */
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("ng_token") : null;
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...init, headers, credentials: "include" });
}
