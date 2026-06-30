import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const pipelineColors: Record<string, string> = {
  DRAFT: "#94a3b8",
  SENT: "#3b82f6",
  APPROVED: "var(--theme-primary)",
  REJECTED: "#ef4444",
  EXPIRED: "#f97316",
};

export function QuotesSummary({
  stats,
}: {
  stats: {
    total: number;
    totalValueTry: number;
    openValueTry: number;
    approvedCount: number;
    thisMonthCount: number;
    expiringSoon: number;
    statusPipeline: { status: string; label: string; count: number }[];
  };
}) {
  const cards = [
    {
      title: "Toplam Teklif",
      value: String(stats.total),
      hint: `Bu ay +${stats.thisMonthCount}`,
      icon: FileText,
    },
    {
      title: "Toplam Değer",
      value: formatCurrency(stats.totalValueTry),
      hint: "TRY karşılığı",
      icon: TrendingUp,
    },
    {
      title: "Açık Teklifler",
      value: formatCurrency(stats.openValueTry),
      hint: "Taslak + gönderildi",
      icon: Send,
      accent: "info" as const,
    },
    {
      title: "Onaylanan",
      value: String(stats.approvedCount),
      hint:
        stats.expiringSoon > 0
          ? `${stats.expiringSoon} teklif yakında sona eriyor`
          : "Başarılı teklifler",
      icon: CheckCircle2,
      accent: stats.expiringSoon > 0 ? ("warning" as const) : ("default" as const),
    },
  ];

  const accentMap = {
    default: {
      icon: "bg-[var(--theme-primary-light)] text-[var(--theme-primary)]",
      bar: "bg-[var(--theme-primary)]",
    },
    info: {
      icon: "bg-blue-50 text-blue-600",
      bar: "bg-blue-500",
    },
    warning: {
      icon: "bg-amber-50 text-amber-600",
      bar: "bg-amber-500",
    },
  };

  const sorted = [...stats.statusPipeline].sort((a, b) => b.count - a.count);

  return (
    <>
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

      {stats.total > 0 && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--theme-primary)]" />
            <h2 className="font-semibold text-slate-900">Durum Dağılımı</h2>
          </div>
          <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
            {sorted.map((item) =>
              item.count > 0 ? (
                <div
                  key={item.status}
                  style={{
                    width: `${(item.count / stats.total) * 100}%`,
                    background: pipelineColors[item.status] ?? "#cbd5e1",
                  }}
                  title={`${item.label}: ${item.count}`}
                />
              ) : null
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {sorted.map((item) => (
              <div key={item.status} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: pipelineColors[item.status] ?? "#cbd5e1",
                  }}
                />
                <span className="text-slate-600">{item.label}</span>
                <span className="font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function QuotesHero({
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
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Teklifler</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
            Müşterilerinize gönderdiğiniz teklifleri takip edin, durumlarını yönetin ve
            onaylananları faturaya dönüştürün.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-6 py-4 text-center">
            <p className="text-2xl font-bold text-[var(--theme-primary)]">{total}</p>
            <p className="text-xs text-slate-500">Toplam teklif</p>
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
