"use server";

import { revalidatePath } from "next/cache";
import { masterPrisma } from "@/lib/db/master";
import { requireCompanyAdmin, requireSession } from "@/lib/auth/require";
import { DEFAULT_THEME_COLOR, normalizeThemeColor } from "@/lib/theme";

export async function getCompanyTheme() {
  const session = await requireSession();
  if (!session.companyId) return { color: DEFAULT_THEME_COLOR };

  const company = await masterPrisma.company.findUnique({
    where: { id: session.companyId },
    select: { themeColor: true },
  });

  return { color: normalizeThemeColor(company?.themeColor) };
}

export async function updateCompanyTheme(formData: FormData) {
  await requireCompanyAdmin();
  const session = await requireSession();
  if (!session.companyId) throw new Error("Firma bulunamadı");

  const themeColor = normalizeThemeColor(formData.get("themeColor") as string);

  await masterPrisma.company.update({
    where: { id: session.companyId },
    data: { themeColor },
  });

  revalidatePath("/", "layout");
  revalidatePath("/ayarlar/tema");
}
