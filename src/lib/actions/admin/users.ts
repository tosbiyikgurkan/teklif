"use server";

import { revalidatePath } from "next/cache";
import { masterPrisma } from "@/lib/db/master";
import {
  requireSuperAdmin,
  requireCompanyAdmin,
} from "@/lib/auth/require";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";

export async function getAllUsers() {
  await requireSuperAdmin();
  return masterPrisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: true },
  });
}

export async function getCompanyUsers() {
  const session = await requireCompanyAdmin();
  if (!session.companyId) return [];

  return masterPrisma.user.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    include: { company: true },
  });
}

export async function createUser(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Oturum gerekli");

  const role = formData.get("role") as string;
  const companyId = formData.get("companyId") as string;

  if (session.role === "SUPER_ADMIN") {
    // super admin can create any user
  } else if (session.role === "COMPANY_ADMIN") {
    if (role === "SUPER_ADMIN") throw new Error("Yetkisiz işlem");
    if (companyId !== session.companyId) throw new Error("Yetkisiz işlem");
  } else {
    throw new Error("Yetkisiz işlem");
  }

  const email = formData.get("email") as string;
  const existing = await masterPrisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Bu e-posta adresi zaten kullanılıyor" };
  }

  await masterPrisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(formData.get("password") as string),
      name: formData.get("name") as string,
      role: role as "SUPER_ADMIN" | "COMPANY_ADMIN" | "USER",
      companyId: companyId || null,
    },
  });

  revalidatePath("/admin/kullanicilar");
  revalidatePath("/ayarlar/kullanicilar");
  return { success: true };
}

export async function toggleUserStatus(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Oturum gerekli");

  const user = await masterPrisma.user.findUnique({ where: { id } });
  if (!user) return;

  if (session.role === "COMPANY_ADMIN") {
    if (user.companyId !== session.companyId) throw new Error("Yetkisiz işlem");
    if (user.role === "COMPANY_ADMIN") throw new Error("Yönetici devre dışı bırakılamaz");
  } else if (session.role !== "SUPER_ADMIN") {
    throw new Error("Yetkisiz işlem");
  }

  if (user.id === session.userId) throw new Error("Kendi hesabınızı devre dışı bırakamazsınız");

  await masterPrisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin/kullanicilar");
  revalidatePath("/ayarlar/kullanicilar");
}

export async function deleteUser(id: string) {
  const session = await requireSuperAdmin();
  if (id === session.userId) throw new Error("Kendi hesabınızı silemezsiniz");

  await masterPrisma.user.delete({ where: { id } });
  revalidatePath("/admin/kullanicilar");
}

export async function getAdminStats() {
  await requireSuperAdmin();
  const [companyCount, userCount, activeCompanies] = await Promise.all([
    masterPrisma.company.count(),
    masterPrisma.user.count(),
    masterPrisma.company.count({ where: { isActive: true } }),
  ]);

  return { companyCount, userCount, activeCompanies };
}
