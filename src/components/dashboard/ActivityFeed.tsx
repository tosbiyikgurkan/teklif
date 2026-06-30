import Link from "next/link";
import { FileText, Receipt, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { quoteStatusLabels, invoiceStatusLabels } from "@/lib/labels";

type ActivityItem = {
  id: string;
  type: "quote" | "invoice";
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
  href: string;
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Son Aktiviteler</h2>
        <p className="text-sm text-slate-500">Teklif ve fatura hareketleri</p>
      </div>
      <div className="divide-y divide-slate-50">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Henüz aktivite yok.</p>
        ) : (
          items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  item.type === "quote"
                    ? "bg-[var(--theme-primary-light)] text-[var(--theme-primary)]"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.type === "quote" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <Receipt className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {item.title}
                  </p>
                  <Badge status={item.status}>
                    {item.type === "quote"
                      ? quoteStatusLabels[item.status as keyof typeof quoteStatusLabels]
                      : invoiceStatusLabels[item.status as keyof typeof invoiceStatusLabels]}
                  </Badge>
                </div>
                <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(item.amount, item.currency)}
                </p>
                <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[var(--theme-primary)]" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
