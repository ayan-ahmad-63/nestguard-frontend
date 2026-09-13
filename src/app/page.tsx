"use client";
import Landing from "@/pages/Landing";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return <Landing onLogin={() => router.push("/login")} />;
}
