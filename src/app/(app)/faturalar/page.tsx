import Link from "next/link";
import { Plus } from "lucide-react";
import { getInvoices } from "@/lib/actions/invoices";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { invoiceStatusLabels } from "@/lib/labels";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div>
      <PageHeader
        title="Faturalar"
        description="Faturalarınızı oluşturun ve ödemeleri takip edin"
        action={
          <Button href="/faturalar/yeni">
            <Plus className="h-4 w-4" />
            Yeni Fatura
          </Button>
        }
      />

      {invoices.length === 0 ? (
        <EmptyState
          title="Henüz fatura yok"
          description="İlk faturanızı oluşturarak başlayın."
          action={
            <Button href="/faturalar/yeni">
              <Plus className="h-4 w-4" />
              Fatura Oluştur
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Fatura No</th>
                  <th className="px-6 py-3 font-medium">Müşteri</th>
                  <th className="px-6 py-3 font-medium">Tarih</th>
                  <th className="px-6 py-3 font-medium">Vade</th>
                  <th className="px-6 py-3 font-medium">Durum</th>
                  <th className="px-6 py-3 font-medium text-right">Tutar</th>
                  <th className="px-6 py-3 font-medium text-right">Ödenen</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/faturalar/${invoice.id}`}
                        className="font-medium text-slate-900 hover:text-emerald-600"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">{invoice.customer.name}</td>
                    <td className="px-6 py-4 text-sm">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={invoice.status}>
                        {invoiceStatusLabels[invoice.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-emerald-600">
                      {formatCurrency(invoice.paidAmount, invoice.currency)}
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
