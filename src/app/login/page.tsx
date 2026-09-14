"use client";
import Login from "@/pages/Login";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/providers/AppProvider";

/**
 * "Back" on the login page goes to the marketing site, not to "/" in this app.
 * "/" in nestguard-frontend now immediately redirects to /dashboard or /login,
 * which would loop back here. The correct destination is nestguard.ai.
 */
const MARKETING_SITE_URL =
  process.env.NEXT_PUBLIC_MARKETING_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

export default function Page() {
  const router = useRouter();
  const { setAuthed } = useAppContext();

  return (
    <Login
      onLogin={() => {
        setAuthed(true);
        router.push("/dashboard");
      }}
      onBack={() => {
        window.location.href = MARKETING_SITE_URL;
      }}
    />
  );
}
