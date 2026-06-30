"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "@/lib/actions/invoices";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import {
  LineItemsForm,
  type LineItem,
  type CatalogService,
} from "@/components/forms/LineItemsForm";
import { CurrencyFields } from "@/components/forms/CurrencyFields";
import { BASE_CURRENCY } from "@/lib/currency";

type Customer = { id: string; name: string };

export default function InvoiceForm({
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
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );

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
    if (items.length === 0) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("items", JSON.stringify(items));
    formData.set("taxRate", String(taxRate));
    formData.set("currency", currency);
    formData.set("exchangeRate", String(exchangeRate));

    try {
      const invoice = await createInvoice(formData);
      router.push(`/faturalar/${invoice.id}`);
    } catch {
      setLoading(false);
    }
  }

  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);

  return (
    <div>
      <PageHeader title="Yeni Fatura" description="Yeni fatura oluşturun" />

      <Card className="max-w-4xl">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Müşteri *" name="customerId" required>
                <option value="">Müşteri seçin</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Vade Tarihi"
                name="dueDate"
                type="date"
                defaultValue={defaultDueDate.toISOString().split("T")[0]}
              />
            </div>

            <CurrencyFields
              currency={currency}
              exchangeRate={exchangeRate}
              onCurrencyChange={handleCurrencyChange}
              onExchangeRateChange={setExchangeRate}
              subtotal={subtotal + subtotal * (taxRate / 100)}
            />

            <LineItemsForm
              items={items}
              onChange={setItems}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              catalog={catalog}
              quoteCurrency={currency}
              exchangeRates={latestRates}
            />

            <Textarea label="Notlar" name="notes" rows={3} />

            <div className="flex gap-3">
              <Button type="submit" disabled={loading || items.length === 0}>
                {loading ? "Kaydediliyor..." : "Faturayı Kaydet"}
              </Button>
              <Button href="/faturalar" variant="secondary">
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
