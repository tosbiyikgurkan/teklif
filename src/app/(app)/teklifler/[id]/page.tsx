import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileDown,
  Receipt,
  User,
  Calendar,
  Package,
  Coins,
  Clock,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  Building2,
  ExternalLink,
  FileText,
} from "lucide-react";
import { getQuote } from "@/lib/actions/quotes";
import {
  updateQuoteStatus,
  convertQuoteToInvoice,
  deleteQuote,
} from "@/lib/actions/quotes";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { quoteStatusLabels, invoiceStatusLabels } from "@/lib/labels";
import { CompanyLetterhead } from "@/components/company/CompanyLetterhead";
import { QuoteDeleteButton } from "@/components/quotes/QuoteDeleteButton";
import { getQuoteValidity } from "@/lib/quote-validity";
import {
  BASE_CURRENCY,
  convertToTry,
  formatExchangeRate,
  isForeignCurrency,
} from "@/lib/currency";
import { cn } from "@/lib/utils";

const validityStyles = {
  none: "text-slate-600",
  active: "text-slate-900",
  expiring: "text-amber-600",
  expired: "text-red-600",
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) notFound();

  const validity = getQuoteValidity(quote.validUntil, quote.status);
  const tryTotal = convertToTry(quote.total, quote.currency, quote.exchangeRate);

  async function handleStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    await updateQuoteStatus(id, status);
  }

  async function handleQuickStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    await updateQuoteStatus(id, status);
  }

  async function handleConvert() {
    "use server";
    const invoice = await convertQuoteToInvoice(id);
    const { redirect } = await import("next/navigation");
    redirect(`/faturalar/${invoice.id}`);
  }

  async function handleDelete() {
    "use server";
    await deleteQuote(id);
    const { redirect } = await import("next/navigation");
    redirect("/teklifler");
  }

  const quickActions: { status: string; label: string }[] = [];
  if (quote.status === "DRAFT") {
    quickActions.push({ status: "SENT", label: "Gönderildi olarak işaretle" });
  }
  if (quote.status === "SENT") {
    quickActions.push({ status: "APPROVED", label: "Onayla" });
    quickActions.push({ status: "REJECTED", label: "Reddet" });
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

      <CompanyLetterhead />

      <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            background: `linear-gradient(135deg, var(--theme-primary) 0%, transparent 55%)`,
          }}
        />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  {quote.quoteNumber}
                </h1>
                <Badge status={quote.status}>
                  {quoteStatusLabels[quote.status]}
                </Badge>
                {validity.state === "expiring" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    <AlertTriangle className="h-3 w-3" />
                    {validity.label}
                  </span>
                )}
                {validity.state === "expired" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    Süresi doldu
                  </span>
                )}
              </div>

              <Link
                href={`/musteriler/${quote.customer.id}`}
                className="mt-2 inline-flex items-center gap-1.5 text-base text-slate-600 hover:text-[var(--theme-primary)]"
              >
                <User className="h-4 w-4" />
                {quote.customer.name}
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </Link>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Oluşturulma: {formatDate(quote.createdAt)}
                </span>
                {quote.validUntil && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Geçerlilik: {formatDate(quote.validUntil)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" />
                  {quote.currency}
                  {isForeignCurrency(quote.currency) && (
                    <> · 1 {quote.currency} = {formatExchangeRate(quote.currency, quote.exchangeRate)} ₺</>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button href={`/api/teklifler/${id}/pdf`} target="_blank" variant="secondary" size="sm">
                <FileDown className="h-4 w-4" />
                PDF İndir
              </Button>
              {quote.status === "APPROVED" && quote.invoices.length === 0 && (
                <form action={handleConvert}>
                  <Button type="submit" size="sm">
                    <Receipt className="h-4 w-4" />
                    Faturaya Dönüştür
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute left-0 top-0 h-1 w-full bg-[var(--theme-primary)]" />
          <p className="text-sm text-slate-500">Genel Toplam</p>
          <p className="mt-1 text-2xl font-bold text-[var(--theme-primary)]">
            {formatCurrency(quote.total, quote.currency)}
          </p>
          {isForeignCurrency(quote.currency) && (
            <p className="mt-1 text-xs text-slate-400">
              ≈ {formatCurrency(tryTotal, BASE_CURRENCY)}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Ara Toplam + KDV</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(quote.subtotal, quote.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            KDV %{quote.taxRate}: {formatCurrency(quote.taxAmount, quote.currency)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Kalemler</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{quote.items.length}</p>
          <p className="mt-1 text-xs text-slate-400">Teklif satırı</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Geçerlilik</p>
          <p className={cn("mt-1 text-2xl font-bold", validityStyles[validity.state])}>
            {quote.validUntil ? formatDate(quote.validUntil) : "—"}
          </p>
          <p className={cn("mt-1 text-xs", validityStyles[validity.state])}>
            {validity.label}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[var(--theme-primary)]" />
              <h3 className="font-semibold">Teklif Kalemleri</h3>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-sm text-slate-500">
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Açıklama</th>
                    <th className="px-6 py-3 font-medium text-right">Birim</th>
                    <th className="px-6 py-3 font-medium text-right">Miktar</th>
                    <th className="px-6 py-3 font-medium text-right">Birim Fiyat</th>
                    <th className="px-6 py-3 font-medium text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">
                          {item.description}
                        </p>
                        {item.detailDescription && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {item.detailDescription}
                          </p>
                        )}
                        {item.serviceId && (
                          <Link
                            href={`/hizmetler/${item.serviceId}`}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--theme-primary)] hover:underline"
                          >
                            <FileText className="h-3 w-3" />
                            Hizmet detayı
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600">
                        {formatCurrency(item.unitPrice, quote.currency)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                        {formatCurrency(item.total, quote.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50/50">
                    <td colSpan={5} className="px-6 py-3 text-right text-sm text-slate-500">
                      Ara Toplam
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium">
                      {formatCurrency(quote.subtotal, quote.currency)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td colSpan={5} className="px-6 py-2 text-right text-sm text-slate-500">
                      KDV (%{quote.taxRate})
                    </td>
                    <td className="px-6 py-2 text-right text-sm">
                      {formatCurrency(quote.taxAmount, quote.currency)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/80">
                    <td colSpan={5} className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                      Genel Toplam
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-[var(--theme-primary)]">
                      {formatCurrency(quote.total, quote.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--theme-primary)]" />
                <h3 className="font-semibold">Müşteri</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Link
                  href={`/musteriler/${quote.customer.id}`}
                  className="font-semibold text-slate-900 hover:text-[var(--theme-primary)]"
                >
                  {quote.customer.name}
                </Link>
              </div>
              {quote.customer.city && (
                <div className="flex gap-2 text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {quote.customer.city}
                </div>
              )}
              {quote.customer.email && (
                <div className="flex gap-2 text-slate-600">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {quote.customer.email}
                </div>
              )}
              {quote.customer.phone && (
                <div className="flex gap-2 text-slate-600">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {quote.customer.phone}
                </div>
              )}
              {quote.customer.taxNumber && (
                <div className="flex gap-2 text-slate-600">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  VKN {quote.customer.taxNumber}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Durum Yönetimi</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.length > 0 && (
                <div className="flex flex-col gap-2">
                  {quickActions.map((action) => (
                    <form key={action.status} action={handleQuickStatus}>
                      <input type="hidden" name="status" value={action.status} />
                      <Button
                        type="submit"
                        variant={action.status === "REJECTED" ? "secondary" : "primary"}
                        size="sm"
                        className="w-full"
                      >
                        {action.label}
                      </Button>
                    </form>
                  ))}
                </div>
              )}

              <form action={handleStatus} className="space-y-3 border-t border-slate-100 pt-4">
                <label className="block text-xs font-medium text-slate-500">
                  Durumu değiştir
                </label>
                <select
                  name="status"
                  defaultValue={quote.status}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[var(--theme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
                >
                  {Object.entries(quoteStatusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="secondary" className="w-full" size="sm">
                  Güncelle
                </Button>
              </form>
            </CardContent>
          </Card>

          {quote.notes && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Notlar</h3>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-slate-600">{quote.notes}</p>
              </CardContent>
            </Card>
          )}

          {quote.invoices.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[var(--theme-primary)]" />
                  <h3 className="font-semibold">Bağlı Faturalar</h3>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-slate-50 p-0">
                {quote.invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/faturalar/${inv.id}`}
                    className="flex items-center justify-between px-5 py-3 text-sm hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{formatDate(inv.issueDate)}</p>
                    </div>
                    <div className="text-right">
                      <Badge status={inv.status}>
                        {invoiceStatusLabels[inv.status]}
                      </Badge>
                      <p className="mt-1 text-xs font-medium">
                        {formatCurrency(inv.total, inv.currency)}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          <QuoteDeleteButton action={handleDelete} />
        </div>
      </div>
    </div>
  );
}
