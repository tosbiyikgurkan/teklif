"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Calendar,
  Coins,
  Package,
  FileText,
  StickyNote,
} from "lucide-react";
import { createQuote } from "@/lib/actions/quotes";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import {
  LineItemsForm,
  type LineItem,
  type CatalogService,
} from "@/components/forms/LineItemsForm";
import { CurrencyFields } from "@/components/forms/CurrencyFields";
import { QuoteFormSummary } from "@/components/quotes/QuoteFormSummary";
import { BASE_CURRENCY } from "@/lib/currency";

type Customer = { id: string; name: string };

function defaultValidUntil() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function QuoteForm({
  customers,
  catalog,
  defaultCurrency,
  latestRates,
}: {
  customers: Customer[];
  catalog: CatalogService[];
  defaultCurrency: string;
  latestRates: Record<string, number>;
}) {
  const router = useRouter();
  const [items, setItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(20);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [exchangeRate, setExchangeRate] = useState(
    defaultCurrency === BASE_CURRENCY ? 1 : latestRates[defaultCurrency] || 1
  );
  const [customerId, setCustomerId] = useState("");
  const [validUntil, setValidUntil] = useState(defaultValidUntil);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  function handleCurrencyChange(next: string) {
    setCurrency(next);
    if (next === BASE_CURRENCY) {
      setExchangeRate(1);
    } else {
      setExchangeRate(latestRates[next] || 1);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0 || !customerId) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("customerId", customerId);
    formData.set("items", JSON.stringify(items));
    formData.set("taxRate", String(taxRate));
    formData.set("currency", currency);
    formData.set("exchangeRate", String(exchangeRate));
    if (validUntil) formData.set("validUntil", validUntil);

    try {
      const quote = await createQuote(formData);
      router.push(`/teklifler/${quote.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[1200px]">
      <div className="mb-6">
        <Link
          href="/teklifler"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--theme-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Tekliflere Dön
        </Link>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background: `linear-gradient(135deg, var(--theme-primary) 0%, transparent 60%)`,
          }}
        />
        <div className="relative p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Yeni Teklif</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
            Müşterinizi seçin, hizmet kalemlerini ekleyin ve profesyonel bir teklif oluşturun.
            Katalogdan eklenen hizmetlerin detay sayfaları PDF&apos;e otomatik dahil edilir.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--theme-primary)]" />
                  <h3 className="font-semibold">Müşteri ve Tarih</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label="Müşteri *"
                    name="customerId"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                  >
                    <option value="">Müşteri seçin</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Geçerlilik Tarihi"
                    name="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
                {customers.length === 0 && (
                  <p className="mt-3 text-sm text-amber-600">
                    Henüz müşteri yok.{" "}
                    <Link href="/musteriler/yeni" className="font-medium underline">
                      Önce müşteri ekleyin
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-[var(--theme-primary)]" />
                  <h3 className="font-semibold">Para Birimi</h3>
                </div>
              </CardHeader>
              <CardContent>
                <CurrencyFields
                  currency={currency}
                  exchangeRate={exchangeRate}
                  onCurrencyChange={handleCurrencyChange}
                  onExchangeRateChange={setExchangeRate}
                  subtotal={total}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[var(--theme-primary)]" />
                  <h3 className="font-semibold">Teklif Kalemleri</h3>
                </div>
              </CardHeader>
              <CardContent>
                <LineItemsForm
                  items={items}
                  onChange={setItems}
                  taxRate={taxRate}
                  onTaxRateChange={setTaxRate}
                  catalog={catalog}
                  quoteCurrency={currency}
                  exchangeRates={latestRates}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-[var(--theme-primary)]" />
                  <h3 className="font-semibold">Notlar</h3>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  label="Teklif notları (isteğe bağlı)"
                  name="notes"
                  rows={3}
                  placeholder="Müşteriye iletilecek ek bilgiler, ödeme koşulları vb."
                />
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3 pb-8">
              <Button
                type="submit"
                disabled={loading || items.length === 0 || !customerId}
                size="lg"
              >
                <FileText className="h-4 w-4" />
                {loading ? "Kaydediliyor..." : "Teklifi Kaydet"}
              </Button>
              <Button href="/teklifler" variant="secondary" size="lg">
                İptal
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <QuoteFormSummary
              customers={customers}
              customerId={customerId}
              validUntil={validUntil}
              currency={currency}
              exchangeRate={exchangeRate}
              itemCount={items.length}
              subtotal={subtotal}
              taxRate={taxRate}
              taxAmount={taxAmount}
              total={total}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
