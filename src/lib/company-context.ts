import { masterPrisma } from "@/lib/db/master";
import type { SessionPayload } from "@/lib/auth/session";

export async function getCompanySlugForSession(
  session: SessionPayload
): Promise<string> {
  if (!session.companyId) {
    throw new Error("Firma bilgisi bulunamadı");
  }

  const company = await masterPrisma.company.findUnique({
    where: { id: session.companyId },
    select: { slug: true },
  });

  if (!company?.slug) {
    throw new Error("Firma bulunamadı");
  }

  return company.slug;
}
