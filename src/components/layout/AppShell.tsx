"use client";

import { Sidebar } from "./Sidebar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { SessionPayload } from "@/lib/auth/session";

export type CompanyBranding = {
  name: string;
  logoPath: string | null;
};

export function AppShell({
  children,
  session,
  themeColor,
  branding,
}: {
  children: React.ReactNode;
  session: SessionPayload;
  themeColor: string;
  branding: CompanyBranding;
}) {
  return (
    <ThemeProvider themeColor={themeColor}>
      <div className="flex min-h-screen bg-slate-50/80">
        <Sidebar session={session} branding={branding} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}
