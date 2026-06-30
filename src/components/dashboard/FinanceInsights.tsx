import Link from "next/link";
import { AlertCircle, Clock, Target, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function FinanceInsights({
  pendingInvoiceCount,
  pendingInvoiceTotal,
  totalReceivable,
  overdueCount,
  openQuoteValue,
  collectionRate,
}: {
  pendingInvoiceCount: number;
  pendingInvoiceTotal: number;
  totalReceivable: number;
  overdueCount: number;
  openQuoteValue: number;
  collectionRate: number;
}) {
  const cards = [
    {
      title: "Bekleyen Faturalar",
      value: `${pendingInvoiceCount} adet`,
      sub: formatCurrency(pendingInvoiceTotal),
      icon: Clock,
      tone: "amber" as const,
    },
    {
      title: "Toplam Alacak",
      value: formatCurrency(totalReceivable),
      sub: "Cari bakiye (TRY)",
      icon: Wallet,
      tone: "blue" as const,
    },
    {
      title: "Vadesi Geçen",
      value: String(overdueCount),
      sub: "fatura",
      icon: AlertCircle,
      tone: "red" as const,
    },
    {
      title: "Açık Teklif Değeri",
      value: formatCurrency(openQuoteValue),
      sub: `Tahsilat oranı %${collectionRate}`,
      icon: Target,
      tone: "theme" as const,
    },
  ];

  const toneMap = {
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    theme: "bg-[var(--theme-primary-light)] text-[var(--theme-primary)]",
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneMap[card.tone]}`}
          >
            <card.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="text-lg font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogPreview({
  services,
}: {
  services: {
    id: string;
    name: string;
    unit: string;
    unitPrice: number;
    currency: string;
  }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">Hizmet Kataloğu</h2>
          <p className="text-sm text-slate-500">Son eklenen tanımlar</p>
        </div>
        <Link
          href="/hizmetler"
          className="text-sm font-medium text-[var(--theme-primary)] hover:underline"
        >
          Tümü
        </Link>
      </div>
      <div className="divide-y divide-slate-50">
        {services.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Henüz hizmet tanımı yok.</p>
        ) : (
          services.map((service) => (
            <Link
              key={service.id}
              href={`/hizmetler/${service.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{service.name}</p>
                <p className="text-xs text-slate-500">{service.unit}</p>
              </div>
              <p className="text-sm font-semibold text-[var(--theme-primary)]">
                {formatCurrency(service.unitPrice, service.currency)}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
