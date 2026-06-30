import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { getInvoice } from "@/lib/actions/invoices";
import { addPayment } from "@/lib/actions/invoices";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { invoiceStatusLabels } from "@/lib/labels";
import { CurrencyNote } from "@/components/ui/CurrencyNote";
import { CompanyLetterhead } from "@/components/company/CompanyLetterhead";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) notFound();

  const remaining = invoice.total - invoice.paidAmount;

  async function handlePayment(formData: FormData) {
    "use server";
    formData.set("invoiceId", id);
    await addPayment(formData);
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/faturalar"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Faturalara Dön
        </Link>
      </div>

      <CompanyLetterhead />

      <PageHeader
        title={invoice.invoiceNumber}
        description={`${invoice.customer.name} · ${formatDate(invoice.issueDate)}`}
        action={
          <Badge status={invoice.status}>
            {invoiceStatusLabels[invoice.status]}
          </Badge>
        }
      />

      <div className="mb-6">
        <CurrencyNote
          currency={invoice.currency}
          exchangeRate={invoice.exchangeRate}
          total={invoice.total}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold">Fatura Kalemleri</h3>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Açıklama</th>
                  <th className="px-6 py-3 font-medium text-right">Birim</th>
                  <th className="px-6 py-3 font-medium text-right">Miktar</th>
                  <th className="px-6 py-3 font-medium text-right">Birim Fiyat</th>
                  <th className="px-6 py-3 font-medium text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="px-6 py-3 text-sm">{item.description}</td>
                    <td className="px-6 py-3 text-right text-sm">{item.unit}</td>
                    <td className="px-6 py-3 text-right text-sm">{item.quantity}</td>
                    <td className="px-6 py-3 text-right text-sm">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200">
                  <td colSpan={4} className="px-6 py-3 text-right text-sm text-slate-500">
                    Genel Toplam
                  </td>
                  <td className="px-6 py-3 text-right text-lg font-bold text-emerald-600">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="py-5">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Toplam</span>
                  <span className="font-medium">{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Ödenen</span>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(invoice.paidAmount, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm">
                  <span className="font-medium">Kalan</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(remaining, invoice.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {remaining > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Ödeme Ekle</h3>
              </CardHeader>
              <CardContent>
                <form action={handlePayment} className="space-y-3">
                  <Input
                    label="Tutar"
                    name="amount"
                    type="number"
                    step="0.01"
                    max={remaining}
                    required
                  />
                  <Select label="Ödeme Yöntemi" name="method">
                    <option value="Nakit">Nakit</option>
                    <option value="Havale">Havale/EFT</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Çek">Çek</option>
                  </Select>
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4" />
                    Ödeme Kaydet
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Ödeme Geçmişi</h3>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Tarih</th>
                  <th className="px-6 py-3 font-medium">Yöntem</th>
                  <th className="px-6 py-3 font-medium text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-50">
                    <td className="px-6 py-3 text-sm">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-3 text-sm">{payment.method || "-"}</td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-emerald-600">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
