import { redirect } from "next/navigation";
import { requireCompanyAdmin } from "@/lib/auth/require";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCompanyAdmin();
  return children;
}
