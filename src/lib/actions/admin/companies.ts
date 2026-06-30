"use server";

import { revalidatePath } from "next/cache";
import { masterPrisma } from "@/lib/db/master";
import { requireSuperAdmin } from "@/lib/auth/require";
import { provisionTenantDatabase, slugify } from "@/lib/db/provision-tenant";
import { hashPassword } from "@/lib/auth/password";

export async function getCompanies() {
  await requireSuperAdmin();
  return masterPrisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true } } },
  });
}

export async function getCompany(id: string) {
  await requireSuperAdmin();
  return masterPrisma.company.findUnique({
    where: { id },
    include: { users: true },
  });
}

export async function createCompany(formData: FormData) {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  let slug = (formData.get("slug") as string) || slugify(name);

  const existing = await masterPrisma.company.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const dbPath = provisionTenantDatabase(slug);

  const company = await masterPrisma.company.create({
    data: {
      name,
      slug,
      dbPath,
      taxNumber: (formData.get("taxNumber") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      city: (formData.get("city") as string) || null,
    },
  });

  const adminEmail = formData.get("adminEmail") as string;
  const adminPassword = formData.get("adminPassword") as string;
  const adminName = (formData.get("adminName") as string) || "Firma Yöneticisi";

  if (adminEmail && adminPassword) {
    await masterPrisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
        name: adminName,
        role: "COMPANY_ADMIN",
        companyId: company.id,
      },
    });
  }

  revalidatePath("/admin/firmalar");
  return company;
}

export async function toggleCompanyStatus(id: string) {
  await requireSuperAdmin();
  const company = await masterPrisma.company.findUnique({ where: { id } });
  if (!company) return;

  await masterPrisma.company.update({
    where: { id },
    data: { isActive: !company.isActive },
  });

  revalidatePath("/admin/firmalar");
  revalidatePath(`/admin/firmalar/${id}`);
}

export async function deleteCompany(id: string) {
  await requireSuperAdmin();
  await masterPrisma.company.delete({ where: { id } });
  revalidatePath("/admin/firmalar");
}
