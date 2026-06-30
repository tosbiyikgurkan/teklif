import { Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function DashboardHero({
  userName,
  companyName,
  thisMonthRevenue,
  newQuotesThisMonth,
  newCustomersThisMonth,
}: {
  userName: string;
  companyName: string;
  thisMonthRevenue: number;
  newQuotesThisMonth: number;
  newCustomersThisMonth: number;
}) {
  const today = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          background: `linear-gradient(135deg, var(--theme-primary) 0%, transparent 55%)`,
        }}
      />
      <div
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-10"
        style={{ background: "var(--theme-primary)" }}
      />
      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 text-[var(--theme-primary)]" />
            <span className="capitalize">{today}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Hoş geldiniz, {userName.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
            <span className="font-medium text-slate-800">{companyName}</span> için
            güncel özet — teklifler, tahsilat ve cari durum tek ekranda.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center">
            <p className="text-xs text-slate-500">Bu Ay Gelir</p>
            <p className="mt-1 text-sm font-bold text-slate-900 md:text-base">
              {formatCurrency(thisMonthRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center">
            <p className="text-xs text-slate-500">Yeni Teklif</p>
            <p className="mt-1 text-sm font-bold text-slate-900 md:text-base">
              {newQuotesThisMonth}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center">
            <p className="text-xs text-slate-500">Yeni Müşteri</p>
            <p className="mt-1 text-sm font-bold text-slate-900 md:text-base">
              {newCustomersThisMonth}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
