import React from "react";
import type { Metadata } from "next";
import { AppProvider } from "@/components/providers/AppProvider";
import "@/index.css";

export const metadata: Metadata = {
  title: "NestGuard",
  description: "Next-generation hostel security platform",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
