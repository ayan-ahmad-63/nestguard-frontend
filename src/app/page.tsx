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
  const hasSession = cookieStore.has("ng_session");
  redirect(hasSession ? "/dashboard" : "/login");
}
