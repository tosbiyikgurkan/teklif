"use client";

import { AdminSidebar } from "./AdminSidebar";
import type { SessionPayload } from "@/lib/auth/session";

export function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: SessionPayload;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar session={session} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
