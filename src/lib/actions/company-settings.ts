"use server";

import { revalidatePath } from "next/cache";
import { masterPrisma } from "@/lib/db/master";
import { requireCompanyAdmin, requireSession } from "@/lib/auth/require";

export type CompanyProfile = {
  id: string;
  name: string;
  slug: string;
  taxNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  logoPath: string | null;
  logoLightPath: string | null;
  isActive: boolean;
  createdAt: Date;
};

export async function getCompanyBranding() {
  const session = await requireSession();
  if (!session.companyId) {
    return { name: "TeklifPro", logoPath: null as string | null };
  }

  const company = await masterPrisma.company.findUnique({
    where: { id: session.companyId },
    select: { name: true, logoPath: true },
  });

  return {
    name: company?.name ?? session.companyName ?? "Firma",
    logoPath: company?.logoPath ?? null,
  };
}

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  await requireCompanyAdmin();
  const session = await requireSession();
  if (!session.companyId) return null;

  return masterPrisma.company.findUnique({
    where: { id: session.companyId },
    select: {
      id: true,
      name: true,
      slug: true,
      taxNumber: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      logoPath: true,
      logoLightPath: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateCompanyProfile(formData: FormData) {
  await requireCompanyAdmin();
  const session = await requireSession();
  if (!session.companyId) throw new Error("Firma bulunamadı");

  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Firma adı zorunludur");

  await masterPrisma.company.update({
    where: { id: session.companyId },
    data: {
      name,
      taxNumber: (formData.get("taxNumber") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      address: (formData.get("address") as string)?.trim() || null,
      city: (formData.get("city") as string)?.trim() || null,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/ayarlar/firma");
}

export async function removeCompanyLogo() {
  await requireCompanyAdmin();
  const session = await requireSession();
  if (!session.companyId) throw new Error("Firma bulunamadı");

  await masterPrisma.company.update({
    where: { id: session.companyId },
    data: { logoPath: null },
  });

  revalidatePath("/", "layout");
  revalidatePath("/ayarlar/firma");
}

export async function removeCompanyLogoLight() {
  await requireCompanyAdmin();
  const session = await requireSession();
  if (!session.companyId) throw new Error("Firma bulunamadı");

  await masterPrisma.company.update({
    where: { id: session.companyId },
    data: { logoLightPath: null },
  });

  revalidatePath("/", "layout");
  revalidatePath("/ayarlar/firma");
}
