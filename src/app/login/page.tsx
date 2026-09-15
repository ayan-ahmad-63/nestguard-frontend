"use client";
import Login from "@/views/Login";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/providers/AppProvider";

/**
 * "Back" on the login page goes to the marketing site, not to "/" in this app.
 * "/" in nestguard-frontend redirects to /dashboard or /login.
 * The correct destination is nestguard.live.
 */
const defaultMarketingUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://nestguard.live";

const MARKETING_SITE_URL =
  process.env.NEXT_PUBLIC_MARKETING_URL?.replace(/\/$/, "") ||
  defaultMarketingUrl;

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
