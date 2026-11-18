import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_change_this";
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Protected routes that require authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/enrollment",
  "/gates",
  "/logs",
  "/visitors",
  "/alerts",
  "/analytics",
  "/camera",
  "/devices",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isLoginPage = pathname === "/login";

  // Check auth tokens
  const tokenCookie = req.cookies.get("ng_token")?.value;
  const sessionCookie = req.cookies.get("ng_session")?.value;

  let isAuthenticated = false;
  let userRole: string | null = null;

  if (tokenCookie && tokenCookie.trim().length > 10) {
    try {
      const { payload } = await jwtVerify(tokenCookie.trim(), secretKey);
      isAuthenticated = true;
      userRole = (payload.role as string) || null;
    } catch {
      // Token verification failed or expired
      isAuthenticated = false;
    }
  }

  // Fallback for development demo session only
  if (!isAuthenticated && sessionCookie === "true" && process.env.NODE_ENV !== "production") {
    isAuthenticated = true;
  }

  // Explicit logout request -> clear all cookies and allow login page
  if (isLoginPage && req.nextUrl.searchParams.get("logout") === "true") {
    const response = NextResponse.next();
    response.cookies.delete("ng_token");
    response.cookies.delete("ng_session");
    return response;
  }

  // 1. Unauthenticated user accessing a protected route -> redirect to /login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    const response = NextResponse.redirect(loginUrl);
    // Clear any invalid tokens
    response.cookies.delete("ng_token");
    response.cookies.delete("ng_session");
    return response;
  }

  // 2. Authenticated user accessing /login -> redirect to /dashboard
  if (isLoginPage && isAuthenticated && req.nextUrl.searchParams.get("logout") !== "true") {
    const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Enforce Role-Based Access Control (RBAC) on Protected Routes
  const roleCookie = req.cookies.get("ng_role")?.value;
  const effectiveRole = (userRole || roleCookie || "warden").toLowerCase();

  const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
    admin: ["/dashboard", "/enrollment", "/gates", "/logs", "/visitors", "/alerts", "/analytics", "/camera", "/devices"],
    warden: ["/dashboard", "/enrollment", "/logs", "/visitors", "/alerts", "/analytics", "/camera"],
    security: ["/dashboard", "/enrollment", "/gates", "/logs", "/visitors", "/camera", "/devices"],
  };

  const allowedRoutes = ROLE_ALLOWED_ROUTES[effectiveRole] || ROLE_ALLOWED_ROUTES.warden;
  const isRoutePermitted = allowedRoutes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If authenticated user attempts to access an unauthorized route -> redirect to /dashboard
  if (isProtected && !isRoutePermitted) {
    const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  // 4. Attach role header if available for downstream Server Components
  const response = NextResponse.next();
  if (effectiveRole) {
    response.headers.set("x-user-role", effectiveRole);
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
