import { Users, Wallet, TrendingDown, TrendingUp, FileText, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function CustomersSummary({
  stats,
}: {
  stats: {
    total: number;
    totalReceivable: number;
    totalCredit: number;
    debtorCount: number;
    creditorCount: number;
    activeCount: number;
    totalQuotes: number;
    totalInvoices: number;
  };
}) {
  const cards = [
    {
      title: "Toplam Müşteri",
      value: String(stats.total),
      hint: `${stats.activeCount} aktif cari`,
      icon: Users,
    },
    {
      title: "Toplam Alacak",
      value: formatCurrency(stats.totalReceivable),
      hint: `${stats.debtorCount} borçlu müşteri`,
      icon: TrendingUp,
      accent: "danger" as const,
    },
    {
      title: "Toplam Borç (Alınan)",
      value: formatCurrency(stats.totalCredit),
      hint: `${stats.creditorCount} alacaklı bakiye`,
      icon: TrendingDown,
      accent: "success" as const,
    },
    {
      title: "İşlem Hacmi",
      value: `${stats.totalQuotes + stats.totalInvoices}`,
      hint: `${stats.totalQuotes} teklif · ${stats.totalInvoices} fatura`,
      icon: Wallet,
    },
  ];

  const accentMap = {
    default: {
      icon: "bg-[var(--theme-primary-light)] text-[var(--theme-primary)]",
      bar: "bg-[var(--theme-primary)]",
    },
    danger: {
      icon: "bg-red-50 text-red-600",
      bar: "bg-red-500",
    },
    success: {
      icon: "bg-emerald-50 text-emerald-600",
      bar: "bg-emerald-500",
    },
  };

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const accent = accentMap[card.accent ?? "default"];
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className={`absolute left-0 top-0 h-1 w-full ${accent.bar}`} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CustomersHero({
  total,
  action,
}: {
  total: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          background: `linear-gradient(135deg, var(--theme-primary) 0%, transparent 60%)`,
        }}
      />
      <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Müşteriler</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
            Cari hesaplarınızı takip edin, bakiyeleri görün ve müşteri bazlı teklif /
            fatura geçmişine hızlıca ulaşın.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-6 rounded-xl border border-slate-100 bg-slate-50/80 px-6 py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--theme-primary)]">{total}</p>
              <p className="text-xs text-slate-500">Kayıtlı müşteri</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="flex gap-4 text-slate-400">
              <FileText className="h-5 w-5" />
              <Receipt className="h-5 w-5" />
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
