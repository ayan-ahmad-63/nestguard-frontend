import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Must equal JWT_SECRET in the API's .env. No fallback: without it nobody is authenticated.
const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

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

const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  admin: ["/dashboard", "/enrollment", "/gates", "/logs", "/visitors", "/alerts", "/analytics", "/camera", "/devices"],
  warden: ["/dashboard", "/enrollment", "/logs", "/visitors", "/alerts", "/analytics", "/camera"],
  security: ["/dashboard", "/enrollment", "/gates", "/logs", "/visitors", "/camera", "/devices"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isLoginPage = pathname === "/login";

  // Identity comes only from a verified JWT. The ng_role / ng_session cookies are
  // writable from the browser, so they are never trusted for access decisions.
  let userRole: string | null = null;
  const token = req.cookies.get("ng_token")?.value?.trim();
  if (token && secretKey) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      userRole = typeof payload.role === "string" ? payload.role.toLowerCase() : null;
    } catch {
      userRole = null; // bad signature or expired
    }
  }
  const isAuthenticated = userRole !== null && userRole in ROLE_ALLOWED_ROUTES;

  if (isLoginPage && req.nextUrl.searchParams.get("logout") === "true") {
    const response = NextResponse.next();
    response.cookies.delete("ng_token");
    response.cookies.delete("ng_session");
    response.cookies.delete("ng_role");
    return response;
  }

  if (isProtected && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    response.cookies.delete("ng_token");
    response.cookies.delete("ng_session");
    response.cookies.delete("ng_role");
    return response;
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (isProtected && isAuthenticated) {
    const allowed = ROLE_ALLOWED_ROUTES[userRole as string];
    const permitted = allowed.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    if (!permitted) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  const response = NextResponse.next();
  if (userRole) response.headers.set("x-user-role", userRole);
  return response;
}

export default proxy;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
