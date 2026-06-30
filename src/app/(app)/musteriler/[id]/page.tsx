import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Phone,
  Mail,
  Building2,
  FileText,
  Receipt,
  Wallet,
  Pencil,
} from "lucide-react";
import { getCustomer, addTransaction, deleteCustomer } from "@/lib/actions/customers";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { CustomerDeleteButton } from "@/components/customers/CustomerDeleteButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  quoteStatusLabels,
  invoiceStatusLabels,
  transactionTypeLabels,
} from "@/lib/labels";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  async function handleTransaction(formData: FormData) {
    "use server";
    formData.set("customerId", id);
    await addTransaction(formData);
  }

  async function handleDelete() {
    "use server";
    await deleteCustomer(id);
    redirect("/musteriler");
  }

  const canDelete =
    customer._count.quotes === 0 && customer._count.invoices === 0;
  const deleteBlockReason =
    customer._count.quotes > 0 && customer._count.invoices > 0
      ? `${customer._count.quotes} teklif ve ${customer._count.invoices} fatura kaydı var.`
      : customer._count.quotes > 0
        ? `${customer._count.quotes} teklif kaydı var.`
        : customer._count.invoices > 0
          ? `${customer._count.invoices} fatura kaydı var.`
          : undefined;

  const balanceTone =
    customer.balance > 0
      ? "text-red-600"
      : customer.balance < 0
        ? "text-emerald-600"
        : "text-slate-900";

  return (
    <div className="max-w-[1200px]">
      <div className="mb-6">
        <Link
          href="/musteriler"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--theme-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Müşterilere Dön
        </Link>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            background: `linear-gradient(135deg, var(--theme-primary) 0%, transparent 55%)`,
          }}
        />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md"
              style={{ background: "var(--theme-primary)" }}
            >
              {getInitials(customer.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                {customer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {customer.city}
                  </span>
                )}
                {customer.taxNumber && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    VKN {customer.taxNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={`/musteriler/${id}/duzenle`} variant="secondary" size="sm">
              <Pencil className="h-4 w-4" />
              Düzenle
            </Button>
            <Button href={`/teklifler/yeni`} variant="secondary" size="sm">
              <FileText className="h-4 w-4" />
              Teklif
            </Button>
            <Button href={`/faturalar/yeni`} variant="secondary" size="sm">
              <Receipt className="h-4 w-4" />
              Fatura
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Cari Bakiye</p>
          <p className={`mt-1 text-2xl font-bold ${balanceTone}`}>
            {formatCurrency(customer.balance)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {customer.balance > 0
              ? "Müşteriden alacak"
              : customer.balance < 0
                ? "Müşteriye borç"
                : "Dengede"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Teklifler</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {customer.quotes.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Toplam {formatCurrency(customer.quoteTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Faturalar</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {customer.invoices.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {formatCurrency(customer.paidTotal)} tahsil
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Cari Hareket</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {customer.transactions.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Kayıtlı işlem</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">İletişim Bilgileri</h3>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {customer.taxOffice && (
              <div className="flex gap-3">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-slate-500">Vergi Dairesi</p>
                  <p className="font-medium text-slate-900">{customer.taxOffice}</p>
                </div>
              </div>
            )}
            {customer.email && (
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-slate-500">E-posta</p>
                  <p className="font-medium text-slate-900">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-slate-500">Telefon</p>
                  <p className="font-medium text-slate-900">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-slate-500">Adres</p>
                  <p className="font-medium text-slate-900">{customer.address}</p>
                </div>
              </div>
            )}
            {customer.notes && (
              <div className="rounded-lg bg-slate-50 p-3 text-slate-600">
                {customer.notes}
              </div>
            )}
            {!customer.email &&
              !customer.phone &&
              !customer.address &&
              !customer.taxOffice &&
              !customer.notes && (
                <p className="text-slate-500">İletişim bilgisi girilmemiş.</p>
              )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[var(--theme-primary)]" />
              <h3 className="font-semibold">Cari Hareket Ekle</h3>
            </div>
          </CardHeader>
          <CardContent>
            <form action={handleTransaction} className="flex flex-wrap items-end gap-3">
              <div className="w-32">
                <Select label="Tür" name="type" required>
                  <option value="DEBIT">Borç</option>
                  <option value="CREDIT">Alacak</option>
                </Select>
              </div>
              <div className="w-32">
                <Input label="Tutar" name="amount" type="number" step="0.01" required />
              </div>
              <div className="min-w-[200px] flex-1">
                <Input label="Açıklama" name="description" required />
              </div>
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Ekle
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold">Cari Hareketler</h3>
        </CardHeader>
        <CardContent className="p-0">
          {customer.transactions.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">
              Henüz hareket kaydı yok.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Tarih</th>
                  <th className="px-6 py-3 font-medium">Açıklama</th>
                  <th className="px-6 py-3 font-medium">Tür</th>
                  <th className="px-6 py-3 font-medium text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {customer.transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-slate-50 hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-3 text-sm">{formatDate(tx.date)}</td>
                    <td className="px-6 py-3 text-sm">{tx.description}</td>
                    <td className="px-6 py-3">
                      <Badge status={tx.type === "DEBIT" ? "OVERDUE" : "PAID"}>
                        {transactionTypeLabels[tx.type]}
                      </Badge>
                    </td>
                    <td
                      className={`px-6 py-3 text-right text-sm font-semibold ${
                        tx.type === "DEBIT" ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {tx.type === "DEBIT" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Son Teklifler</h3>
              <Link
                href="/teklifler/yeni"
                className="text-xs font-medium text-[var(--theme-primary)] hover:underline"
              >
                + Yeni
              </Link>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-slate-50 p-0">
            {customer.quotes.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">Teklif yok.</p>
            ) : (
              customer.quotes.map((q) => (
                <Link
                  key={q.id}
                  href={`/teklifler/${q.id}`}
                  className="flex items-center justify-between px-5 py-3 text-sm hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{q.quoteNumber}</p>
                    <p className="text-xs text-slate-500">{formatDate(q.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <Badge status={q.status}>{quoteStatusLabels[q.status]}</Badge>
                    <p className="mt-1 text-xs font-medium">
                      {formatCurrency(q.total, q.currency)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Son Faturalar</h3>
              <Link
                href="/faturalar/yeni"
                className="text-xs font-medium text-[var(--theme-primary)] hover:underline"
              >
                + Yeni
              </Link>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-slate-50 p-0">
            {customer.invoices.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">Fatura yok.</p>
            ) : (
              customer.invoices.map((inv) => (
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
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 max-w-md">
        <CardHeader>
          <h3 className="font-semibold text-slate-900">Müşteri İşlemleri</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button href={`/musteriler/${id}/duzenle`} variant="secondary" className="w-full">
            <Pencil className="h-4 w-4" />
            Bilgileri Düzenle
          </Button>
          <CustomerDeleteButton
            action={handleDelete}
            disabled={!canDelete}
            disabledReason={
              deleteBlockReason
                ? `${deleteBlockReason} Önce bu kayıtları kaldırın.`
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
