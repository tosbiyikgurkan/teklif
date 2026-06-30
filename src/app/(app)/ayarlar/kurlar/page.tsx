import { redirect } from "next/navigation";
import {
  fetchTcmbRatesForToday,
  getExchangeRates,
  getCompanyCurrencySettings,
  saveExchangeRate,
  updateCompanyDefaultCurrency,
  seedDefaultRatesIfEmpty,
} from "@/lib/actions/exchange-rates";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { CURRENCIES, formatExchangeRate } from "@/lib/currency";

export default async function ExchangeRatesPage() {
  await seedDefaultRatesIfEmpty();

  const [rates, settings] = await Promise.all([
    getExchangeRates(60),
    getCompanyCurrencySettings(),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  async function handleTcmbSync() {
    "use server";
    await fetchTcmbRatesForToday();
    redirect("/ayarlar/kurlar");
  }

  async function handleSaveRate(formData: FormData) {
    "use server";
    await saveExchangeRate(formData);
    redirect("/ayarlar/kurlar");
  }

  async function handleDefaultCurrency(formData: FormData) {
    "use server";
    await updateCompanyDefaultCurrency(formData);
    redirect("/ayarlar/kurlar");
  }

  return (
    <div>
      <PageHeader
        title="Döviz Kurları"
        description="Günlük kur tanımları ve varsayılan para birimi ayarları"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Kur Geçmişi</h3>
              <form action={handleTcmbSync}>
                <Button type="submit" size="sm" variant="secondary">
                  TCMB&apos;den Güncelle
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {rates.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-500">
                Henüz kur tanımı yok. TCMB&apos;den çekebilir veya manuel girebilirsiniz.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                    <th className="px-6 py-3 font-medium">Tarih</th>
                    <th className="px-6 py-3 font-medium">Para Birimi</th>
                    <th className="px-6 py-3 font-medium text-right">Kur (TRY)</th>
                    <th className="px-6 py-3 font-medium">Kaynak</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr
                      key={rate.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="px-6 py-3 text-sm">{formatDate(rate.date)}</td>
                      <td className="px-6 py-3 text-sm font-medium">{rate.currency}</td>
                      <td className="px-6 py-3 text-right text-sm">
                        {formatExchangeRate(rate.currency, rate.rate)} ₺
                      </td>
                      <td className="px-6 py-3 text-sm capitalize text-slate-500">
                        {rate.source === "tcmb" ? "TCMB" : "Manuel"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Varsayılan Para Birimi</h3>
            </CardHeader>
            <CardContent>
              <form action={handleDefaultCurrency} className="space-y-3">
                <Select
                  label="Yeni teklif/fatura varsayılanı"
                  name="defaultCurrency"
                  defaultValue={settings.defaultCurrency}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </option>
                  ))}
                </Select>
                <Button type="submit" className="w-full">
                  Kaydet
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Manuel Kur Girişi</h3>
            </CardHeader>
            <CardContent>
              <form action={handleSaveRate} className="space-y-3">
                <Input label="Tarih" name="date" type="date" defaultValue={today} required />
                <Select label="Para Birimi" name="currency" required>
                  <option value="USD">ABD Doları (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </Select>
                <Input
                  label="Kur (1 birim = ? TRY)"
                  name="rate"
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  required
                />
                <Button type="submit" className="w-full">
                  Kur Kaydet
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
