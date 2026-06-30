"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpRight,
  FileText,
  Calendar,
  AlertTriangle,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { quoteStatusLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";

export type QuoteListItem = {
  id: string;
  quoteNumber: string;
  status: string;
  currency: string;
  exchangeRate: number;
  total: number;
  createdAt: Date;
  validUntil: Date | null;
  customer: { id: string; name: string; city: string | null };
  _count: { items: number };
};

type StatusFilter =
  | "all"
  | "DRAFT"
  | "SENT"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "expiring";

type SortKey = "newest" | "oldest" | "total-desc" | "total-asc" | "validUntil";

function isExpiringSoon(validUntil: Date | null, status: string): boolean {
  if (!validUntil || !["DRAFT", "SENT"].includes(status)) return false;
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + 7);
  const d = new Date(validUntil);
  return d >= now && d <= limit;
}

function isExpired(validUntil: Date | null, status: string): boolean {
  if (!validUntil || status === "APPROVED" || status === "REJECTED") return false;
  return new Date(validUntil) < new Date();
}

export function QuoteList({ quotes }: { quotes: QuoteListItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = quotes.filter((quote) => {
      if (q) {
        const haystack = [
          quote.quoteNumber,
          quote.customer.name,
          quote.customer.city,
          quoteStatusLabels[quote.status],
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (statusFilter === "expiring") {
        if (!isExpiringSoon(quote.validUntil, quote.status)) return false;
      } else if (statusFilter !== "all" && quote.status !== statusFilter) {
        return false;
      }

      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "total-desc":
          return b.total - a.total;
        case "total-asc":
          return a.total - b.total;
        case "validUntil":
          if (!a.validUntil) return 1;
          if (!b.validUntil) return -1;
          return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }, [quotes, search, statusFilter, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Teklif no, müşteri veya şehir ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-theme w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="focus-theme rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">Tüm durumlar</option>
            <option value="DRAFT">Taslak</option>
            <option value="SENT">Gönderildi</option>
            <option value="APPROVED">Onaylandı</option>
            <option value="REJECTED">Reddedildi</option>
            <option value="EXPIRED">Süresi doldu</option>
            <option value="expiring">Yakında sona eriyor</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="focus-theme rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="newest">En yeni</option>
            <option value="oldest">En eski</option>
            <option value="total-desc">Tutar (yüksek)</option>
            <option value="total-asc">Tutar (düşük)</option>
            <option value="validUntil">Geçerlilik tarihi</option>
          </select>

          <div className="flex rounded-lg border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "rounded-md p-2 transition-colors",
                view === "grid"
                  ? "bg-[var(--theme-primary)] text-white"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn(
                "rounded-md p-2 transition-colors",
                view === "table"
                  ? "bg-[var(--theme-primary)] text-white"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        {filtered.length} / {quotes.length} teklif gösteriliyor
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-700">Sonuç bulunamadı</p>
          <p className="mt-1 text-sm text-slate-500">
            Arama veya filtre kriterlerini değiştirmeyi deneyin.
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((quote) => {
            const expiring = isExpiringSoon(quote.validUntil, quote.status);
            const expired = isExpired(quote.validUntil, quote.status);

            return (
              <Link
                key={quote.id}
                href={`/teklifler/${quote.id}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[var(--theme-primary-muted)] hover:shadow-md"
              >
                {(expiring || expired) && (
                  <div
                    className={cn(
                      "absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      expired
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {expired ? "Süresi doldu" : "Yakında bitiyor"}
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-[var(--theme-primary)]">
                        {quote.quoteNumber}
                      </p>
                      <Badge status={quote.status}>
                        {quoteStatusLabels[quote.status]}
                      </Badge>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[var(--theme-primary)]" />
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{quote.customer.name}</span>
                  {quote.customer.city && (
                    <span className="text-xs text-slate-400">· {quote.customer.city}</span>
                  )}
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(quote.total, quote.currency)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {quote._count.items} kalem
                      {quote.currency !== "TRY" && ` · ${quote.currency}`}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(quote.createdAt)}
                    </div>
                    {quote.validUntil && (
                      <p className="mt-0.5">
                        Geçerlilik: {formatDate(quote.validUntil)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-sm text-slate-500">
                <th className="px-6 py-3 font-medium">Teklif</th>
                <th className="px-6 py-3 font-medium">Müşteri</th>
                <th className="px-6 py-3 font-medium">Tarih</th>
                <th className="px-6 py-3 font-medium">Geçerlilik</th>
                <th className="px-6 py-3 font-medium">Durum</th>
                <th className="px-6 py-3 font-medium text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-slate-50 transition-colors hover:bg-[var(--theme-primary-light)]/30"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/teklifler/${quote.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--theme-primary-light)] text-[var(--theme-primary)]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 hover:text-[var(--theme-primary)]">
                          {quote.quoteNumber}
                        </p>
                        <p className="text-xs text-slate-400">
                          {quote._count.items} kalem
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-medium text-slate-800">{quote.customer.name}</p>
                    {quote.customer.city && (
                      <p className="text-xs text-slate-400">{quote.customer.city}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(quote.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {quote.validUntil ? (
                      <span
                        className={cn(
                          isExpiringSoon(quote.validUntil, quote.status) &&
                            "font-medium text-amber-600",
                          isExpired(quote.validUntil, quote.status) && "text-red-600"
                        )}
                      >
                        {formatDate(quote.validUntil)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={quote.status}>
                      {quoteStatusLabels[quote.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(quote.total, quote.currency)}
                    </p>
                    {quote.currency !== "TRY" && (
                      <p className="text-xs text-slate-400">{quote.currency}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
