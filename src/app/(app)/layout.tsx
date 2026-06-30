import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCompanyTheme } from "@/lib/actions/theme";
import { getCompanyBranding } from "@/lib/actions/company-settings";
import { AppShell } from "@/components/layout/AppShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  if (!session.companyDbPath) {
    redirect("/login");
  }

  const [theme, branding] = await Promise.all([
    getCompanyTheme(),
    getCompanyBranding(),
  ]);

  return (
    <AppShell session={session} themeColor={theme.color} branding={branding}>
      {children}
    </AppShell>
  );
}
