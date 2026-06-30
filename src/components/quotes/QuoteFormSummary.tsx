"use client";

import {
  FileText,
  User,
  Calendar,
  Coins,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  BASE_CURRENCY,
  convertToTry,
  formatExchangeRate,
  isForeignCurrency,
} from "@/lib/currency";

type Customer = { id: string; name: string };

export function QuoteFormSummary({
  customers,
  customerId,
  validUntil,
  currency,
  exchangeRate,
  itemCount,
  subtotal,
  taxRate,
  taxAmount,
  total,
}: {
  customers: Customer[];
  customerId: string;
  validUntil: string;
  currency: string;
  exchangeRate: number;
  itemCount: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}) {
  const customer = customers.find((c) => c.id === customerId);

  return (
    <div className="sticky top-6 space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div
          className="h-1 w-full"
          style={{ background: "var(--theme-primary)" }}
        />
        <div className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--theme-primary)]" />
            <h3 className="font-semibold text-slate-900">Teklif Özeti</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-slate-500">Müşteri</p>
                <p className="font-medium text-slate-900">
                  {customer?.name ?? "Seçilmedi"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-slate-500">Geçerlilik</p>
                <p className="font-medium text-slate-900">
                  {validUntil
                    ? new Intl.DateTimeFormat("tr-TR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(validUntil))
                    : "Belirtilmedi"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Coins className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-slate-500">Para Birimi</p>
                <p className="font-medium text-slate-900">{currency}</p>
                {isForeignCurrency(currency) && (
                  <p className="text-xs text-slate-400">
                    1 {currency} = {formatExchangeRate(currency, exchangeRate)} ₺
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-slate-500">Kalemler</p>
                <p className="font-medium text-slate-900">{itemCount} kalem</p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Ara Toplam</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">KDV (%{taxRate})</span>
              <span>{formatCurrency(taxAmount, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <span className="font-semibold text-slate-900">Genel Toplam</span>
              <span className="text-lg font-bold text-[var(--theme-primary)]">
                {formatCurrency(total, currency)}
              </span>
            </div>
            {isForeignCurrency(currency) && total > 0 && (
              <p className="text-right text-xs text-slate-400">
                ≈ {formatCurrency(convertToTry(total, currency, exchangeRate), BASE_CURRENCY)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        <p>
          Katalogdan eklenen hizmetlerin detay açıklamaları PDF&apos;de ayrı sayfa olarak
          yer alır.
        </p>
      </div>
    </div>
  );
}
