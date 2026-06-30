"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/auth/require";
import { companySlugFromDbPath, deleteServiceUploads } from "@/lib/uploads";

export async function getServices() {
  const { prisma } = await requireTenant();
  return prisma.service.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getService(id: string) {
  const { prisma } = await requireTenant();
  return prisma.service.findUnique({ where: { id } });
}

export async function createService(formData: FormData) {
  const { prisma } = await requireTenant();

  const service = await prisma.service.create({
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      unit: (formData.get("unit") as string) || "adet",
      currency: (formData.get("currency") as string) || "TRY",
      unitPrice: parseFloat(formData.get("unitPrice") as string) || 0,
    },
  });

  revalidatePath("/hizmetler");
  return service;
}

export async function updateService(id: string, formData: FormData) {
  const { prisma } = await requireTenant();

  await prisma.service.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      unit: (formData.get("unit") as string) || "adet",
      currency: (formData.get("currency") as string) || "TRY",
      unitPrice: parseFloat(formData.get("unitPrice") as string) || 0,
    },
  });

  revalidatePath("/hizmetler");
  revalidatePath(`/hizmetler/${id}`);
}

export async function deleteService(id: string) {
  const { prisma, session } = await requireTenant();
  if (session.companyDbPath) {
    const slug = companySlugFromDbPath(session.companyDbPath);
    deleteServiceUploads(slug, id);
  }
  await prisma.service.delete({ where: { id } });
  revalidatePath("/hizmetler");
}
