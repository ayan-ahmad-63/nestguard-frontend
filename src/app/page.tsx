import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Root route for app.nestguard.live.
 *
 * The marketing site (nestguard.live) is a separate deployment — there is
 * nothing to render here. We do a single-hop redirect based on whether the
 * user has an active session cookie, avoiding the two-hop pattern of
 * → /dashboard → (middleware) → /login.
 */
export default async function Page() {
  const cookieStore = await cookies();
  const sessionVal = cookieStore.get("ng_session")?.value;
  const tokenVal = cookieStore.get("ng_token")?.value;
  const lastRouteVal = cookieStore.get("ng_last_route")?.value;

  const isAuthenticated = Boolean(
    sessionVal === "true" || (tokenVal && tokenVal.trim().length > 10)
  );

  const destination = isAuthenticated ? (lastRouteVal || "/dashboard") : "/login";
  redirect(destination);
}
