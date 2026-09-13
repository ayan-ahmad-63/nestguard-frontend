"use client";
import Login from "@/pages/Login";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/providers/AppProvider";

export default function Page() {
  const router = useRouter();
  const { setAuthed } = useAppContext();

  return (
    <Login
      onLogin={() => {
        setAuthed(true);
        router.push("/dashboard");
      }}
      onBack={() => router.push("/")}
    />
  );
}
