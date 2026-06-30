import { requireSuperAdmin } from "@/lib/auth/require";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSuperAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}
