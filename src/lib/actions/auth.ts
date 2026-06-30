"use server";

import { redirect } from "next/navigation";
import { masterPrisma } from "@/lib/db/master";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await masterPrisma.user.findUnique({
    where: { email },
    include: { company: true },
  });

  if (!user || !user.isActive) {
    return { error: "Geçersiz e-posta veya şifre" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Geçersiz e-posta veya şifre" };
  }

  if (user.company && !user.company.isActive) {
    return { error: "Firma hesabınız devre dışı bırakılmış" };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId ?? undefined,
    companyDbPath: user.company?.dbPath,
    companyName: user.company?.name,
  });

  if (user.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
