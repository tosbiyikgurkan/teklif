import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";
import { getTenantPrisma, type TenantPrisma } from "@/lib/db/tenant";

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "SUPER_ADMIN") redirect("/");
  return session;
}

export async function requireCompanyAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "COMPANY_ADMIN" && session.role !== "SUPER_ADMIN") {
    redirect("/");
  }
  return session;
}

export async function requireTenant(): Promise<{
  session: SessionPayload;
  prisma: TenantPrisma;
}> {
  const session = await requireSession();

  if (session.role === "SUPER_ADMIN" && !session.companyDbPath) {
    redirect("/admin");
  }

  if (!session.companyDbPath) {
    redirect("/login");
  }

  return {
    session,
    prisma: getTenantPrisma(session.companyDbPath),
  };
}
