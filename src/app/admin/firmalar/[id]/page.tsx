import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCompany, toggleCompanyStatus } from "@/lib/actions/admin/companies";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { roleLabels } from "@/lib/labels";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  async function handleToggle() {
    "use server";
    await toggleCompanyStatus(id);
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/firmalar"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Firmalara Dön
        </Link>
      </div>

      <PageHeader
        title={company.name}
        description={`Slug: ${company.slug}`}
        action={
          <Badge status={company.isActive ? "APPROVED" : "CANCELLED"}>
            {company.isActive ? "Aktif" : "Pasif"}
          </Badge>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Firma Bilgileri</h3>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Vergi No:</span>{" "}
              {company.taxNumber || "-"}
            </p>
            <p>
              <span className="text-slate-500">E-posta:</span>{" "}
              {company.email || "-"}
            </p>
            <p>
              <span className="text-slate-500">Telefon:</span>{" "}
              {company.phone || "-"}
            </p>
            <p>
              <span className="text-slate-500">Adres:</span>{" "}
              {company.address || "-"}
            </p>
            <p>
              <span className="text-slate-500">Kayıt:</span>{" "}
              {formatDate(company.createdAt)}
            </p>
            <p className="break-all">
              <span className="text-slate-500">Veritabanı:</span>{" "}
              <code className="text-xs">{company.dbPath}</code>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">İşlemler</h3>
          </CardHeader>
          <CardContent>
            <form action={handleToggle}>
              <Button type="submit" variant="secondary">
                {company.isActive ? "Firmayı Devre Dışı Bırak" : "Firmayı Aktifleştir"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Firma Kullanıcıları</h3>
        </CardHeader>
        <CardContent className="p-0">
          {company.users.length === 0 ? (
            <p className="px-6 py-4 text-sm text-slate-500">Kullanıcı yok.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Ad</th>
                  <th className="px-6 py-3 font-medium">E-posta</th>
                  <th className="px-6 py-3 font-medium">Rol</th>
                  <th className="px-6 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {company.users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50">
                    <td className="px-6 py-4 text-sm">{user.name}</td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{roleLabels[user.role]}</td>
                    <td className="px-6 py-4">
                      <Badge status={user.isActive ? "APPROVED" : "CANCELLED"}>
                        {user.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
