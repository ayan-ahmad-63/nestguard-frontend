"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useAppContext } from "@/components/providers/AppProvider";
import { C, F } from "@/lib/constants";
import type { Page } from "@/types";

const PAGE_TITLES: Record<string, { title: string; subtitle: string; page: Page }> = {
  "/dashboard": { title: "Operations Console", subtitle: "Real-time security telemetry & access feed", page: "dashboard" },
  "/gates": { title: "Gate & Device Controllers", subtitle: "Turnstile barriers and optical biometric readers", page: "gates" },
  "/logs": { title: "Access Audit Log", subtitle: "Immutable cryptographic entry & egress timestamps", page: "logs" },
  "/visitors": { title: "Visitor Pass Management", subtitle: "Host authorization and entry pass approval", page: "visitors" },
  "/alerts": { title: "Security Alerts Feed", subtitle: "Critical incident queue & hardware anomaly notifications", page: "alerts" },
  "/analytics": { title: "Intelligence & Analytics", subtitle: "Hostel traffic distribution & student behavioral risk scoring", page: "analytics" },
  "/camera": { title: "Surveillance Monitoring", subtitle: "High-definition CCTV gateway feeds", page: "camera" },
  "/devices": { title: "Hardware Device Health", subtitle: "Battery state of charge, wireless RSSI & heartbeat status", page: "devices" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { alerts, unreadAlertCount, setAuthed } = useAppContext();
  const pathname = usePathname() || "/dashboard";
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const routeInfo = PAGE_TITLES[pathname] || PAGE_TITLES["/dashboard"];
  const page: Page = routeInfo.page;

  return (
    <div className="h-screen p-3 sm:p-5 box-border select-none bg-ng-bg font-body text-ng-text relative overflow-hidden flex">
      {/* Ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[600px] rounded-full pointer-events-none opacity-20 blur-[120px] z-0"
           style={{ background: "radial-gradient(ellipse at center, var(--color-ng-orange), transparent 70%)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[600px] rounded-full pointer-events-none opacity-10 blur-[100px] z-0"
           style={{ background: "radial-gradient(ellipse at center, var(--color-ng-blue), transparent 70%)" }} />

      <div className="h-full flex w-full rounded-[2rem] border border-ng-border overflow-hidden shadow-2xl bg-ng-panel/50 backdrop-blur-3xl relative z-10">
        <Sidebar
          active={page}
          expanded={expanded}
          onNavigate={() => {}}
          onToggle={() => setExpanded(!expanded)}
          alertCount={unreadAlertCount}
          visitorCount={2}
        />
        <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col">
          <div className="h-full flex flex-col rounded-[1.5rem] border border-ng-border overflow-hidden relative shadow-inner bg-ng-bg">
            <TopBar 
              page={page} 
              onNavigate={(p) => router.push(`/${p}`)} 
              onLogout={() => {
                setAuthed(false);
                router.push("/");
              }} 
              alerts={alerts} 
            />
            <main className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="mb-8 flex flex-col gap-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold m-0 tracking-tight font-display text-ng-text">
                  {routeInfo.title}
                </h1>
                <p className="text-sm font-mono m-0 text-ng-muted">
                  {routeInfo.subtitle}
                </p>
              </div>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
