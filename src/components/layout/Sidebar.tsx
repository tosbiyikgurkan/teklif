"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Wrench,
  Building2,
  LogOut,
  UserCog,
  DollarSign,
  Palette,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import type { SessionPayload } from "@/lib/auth/session";
import type { CompanyBranding } from "./AppShell";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Müşteriler", href: "/musteriler", icon: Users },
  { name: "Teklifler", href: "/teklifler", icon: FileText },
  { name: "Faturalar", href: "/faturalar", icon: Receipt },
  { name: "Hizmet Kataloğu", href: "/hizmetler", icon: Wrench },
];

function navLinkClass(isActive: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-[var(--theme-primary)] text-white shadow-sm"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  );
}

export function Sidebar({
  session,
  branding,
}: {
  session: SessionPayload;
  branding: CompanyBranding;
}) {
  const pathname = usePathname();
  const isCompanyAdmin = session.role === "COMPANY_ADMIN";

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800/50 bg-slate-900 text-white">
      <div className="flex items-center gap-3 border-b border-slate-700/80 px-6 py-5">
        {branding.logoPath ? (
          <div className="flex h-11 max-w-[140px] shrink-0 items-center rounded-lg bg-white px-2 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={branding.logoPath}
              alt={branding.name}
              className="max-h-9 w-auto max-w-full object-contain"
            />
          </div>
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-lg"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            <Building2 className="h-5 w-5 text-white" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold leading-tight">
            {branding.name}
          </h1>
          <p className="truncate text-[10px] text-slate-400">TeklifPro</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={navLinkClass(isActive)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {isCompanyAdmin && (
          <div className="pt-4">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Ayarlar
            </p>
            <Link
              href="/ayarlar/firma"
              className={navLinkClass(pathname.startsWith("/ayarlar/firma"))}
            >
              <Building className="h-5 w-5" />
              Firma Ayarları
            </Link>
            <Link
              href="/ayarlar/tema"
              className={navLinkClass(pathname.startsWith("/ayarlar/tema"))}
            >
              <Palette className="h-5 w-5" />
              Tema
            </Link>
            <Link
              href="/ayarlar/kurlar"
              className={navLinkClass(pathname.startsWith("/ayarlar/kurlar"))}
            >
              <DollarSign className="h-5 w-5" />
              Döviz Kurları
            </Link>
            <Link
              href="/ayarlar/kullanicilar"
              className={navLinkClass(pathname.startsWith("/ayarlar/kullanicilar"))}
            >
              <UserCog className="h-5 w-5" />
              Kullanıcılar
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-slate-700/80 p-4">
        <div className="mb-3 truncate rounded-lg bg-slate-800/50 px-3 py-2 text-sm text-slate-300">
          {session.name}
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </form>
      </div>
    </aside>
  );
}
