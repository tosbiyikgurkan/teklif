"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List,
  MapPin,
  Phone,
  Mail,
  FileText,
  Receipt,
  ArrowUpRight,
  Building2,
  Pencil,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type CustomerListItem = {
  id: string;
  name: string;
  taxNumber: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  balance: number;
  createdAt: Date;
  _count: {
    quotes: number;
    invoices: number;
    transactions: number;
  };
};

type BalanceFilter = "all" | "debt" | "credit" | "zero";
type SortKey = "name" | "balance-desc" | "balance-asc" | "newest";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function BalanceBadge({ balance }: { balance: number }) {
  if (balance > 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        Borç {formatCurrency(balance)}
      </span>
    );
  }
  if (balance < 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        Alacak {formatCurrency(Math.abs(balance))}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      Dengede
    </span>
  );
}

export function CustomerList({ customers }: { customers: CustomerListItem[] }) {
  const [search, setSearch] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>("all");
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = customers.filter((c) => {
      if (q) {
        const haystack = [c.name, c.email, c.phone, c.taxNumber, c.city]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (balanceFilter === "debt" && c.balance <= 0) return false;
      if (balanceFilter === "credit" && c.balance >= 0) return false;
      if (balanceFilter === "zero" && c.balance !== 0) return false;

      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "balance-desc":
          return b.balance - a.balance;
        case "balance-asc":
          return a.balance - b.balance;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name, "tr");
      }
    });

    return list;
  }, [customers, search, balanceFilter, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Ad, e-posta, telefon, VKN veya şehir ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-theme w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value as BalanceFilter)}
            className="focus-theme rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">Tüm bakiyeler</option>
            <option value="debt">Borçlu</option>
            <option value="credit">Alacaklı</option>
            <option value="zero">Dengede</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="focus-theme rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="name">Ada göre</option>
            <option value="balance-desc">Bakiye (yüksek)</option>
            <option value="balance-asc">Bakiye (düşük)</option>
            <option value="newest">En yeni</option>
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
              title="Kart görünümü"
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
              title="Tablo görünümü"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        {filtered.length} / {customers.length} müşteri gösteriliyor
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-700">Sonuç bulunamadı</p>
          <p className="mt-1 text-sm text-slate-500">
            Arama veya filtre kriterlerini değiştirmeyi deneyin.
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((customer) => (
            <Link
              key={customer.id}
              href={`/musteriler/${customer.id}`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[var(--theme-primary-muted)] hover:shadow-md"
            >
              <div
                className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full opacity-[0.07]"
                style={{ background: "var(--theme-primary)" }}
              />
              <div className="relative flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                  style={{ background: "var(--theme-primary)" }}
                >
                  {getInitials(customer.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-semibold text-slate-900 group-hover:text-[var(--theme-primary)]">
                      {customer.name}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[var(--theme-primary)]" />
                  </div>
                  {customer.taxNumber && (
                    <p className="text-xs text-slate-400">VKN {customer.taxNumber}</p>
                  )}
                  <div className="mt-2">
                    <BalanceBadge balance={customer.balance} />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                {customer.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{customer.city}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {customer._count.quotes} teklif
                </span>
                <span className="flex items-center gap-1">
                  <Receipt className="h-3.5 w-3.5" />
                  {customer._count.invoices} fatura
                </span>
                <span className="ml-auto text-slate-400">
                  {customer._count.transactions} hareket
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-sm text-slate-500">
                <th className="px-6 py-3 font-medium">Müşteri</th>
                <th className="px-6 py-3 font-medium">İletişim</th>
                <th className="px-6 py-3 font-medium">Şehir</th>
                <th className="px-6 py-3 font-medium text-right">Bakiye</th>
                <th className="px-6 py-3 font-medium text-center">Teklif</th>
                <th className="px-6 py-3 font-medium text-center">Fatura</th>
                <th className="px-6 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-slate-50 transition-colors hover:bg-[var(--theme-primary-light)]/30"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/musteriler/${customer.id}`}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ background: "var(--theme-primary)" }}
                      >
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 hover:text-[var(--theme-primary)]">
                          {customer.name}
                        </p>
                        {customer.taxNumber && (
                          <p className="text-xs text-slate-400">
                            VKN: {customer.taxNumber}
                          </p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="space-y-0.5">
                      {customer.phone && <p>{customer.phone}</p>}
                      {customer.email && (
                        <p className="text-xs text-slate-400">{customer.email}</p>
                      )}
                      {!customer.phone && !customer.email && "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {customer.city || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <BalanceBadge balance={customer.balance} />
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                    {customer._count.quotes}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                    {customer._count.invoices}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/musteriler/${customer.id}/duzenle`}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-[var(--theme-primary)]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </Link>
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
