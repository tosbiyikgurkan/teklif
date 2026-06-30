import Link from "next/link";
import { Plus } from "lucide-react";
import { getCompanies } from "@/lib/actions/admin/companies";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div>
      <PageHeader
        title="Firmalar"
        description="Platforma kayıtlı tüm firmalar"
        action={
          <Button href="/admin/firmalar/yeni">
            <Plus className="h-4 w-4" />
            Yeni Firma
          </Button>
        }
      />

      {companies.length === 0 ? (
        <EmptyState
          title="Henüz firma yok"
          description="İlk firmayı ekleyerek başlayın. Her firma için ayrı veritabanı oluşturulur."
          action={
            <Button href="/admin/firmalar/yeni">
              <Plus className="h-4 w-4" />
              Firma Ekle
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Firma Adı</th>
                  <th className="px-6 py-3 font-medium">Vergi No</th>
                  <th className="px-6 py-3 font-medium">İletişim</th>
                  <th className="px-6 py-3 font-medium">Kullanıcı</th>
                  <th className="px-6 py-3 font-medium">Durum</th>
                  <th className="px-6 py-3 font-medium">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/firmalar/${company.id}`}
                        className="font-medium text-slate-900 hover:text-violet-600"
                      >
                        {company.name}
                      </Link>
                      <p className="text-xs text-slate-400">{company.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{company.taxNumber || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      {company.email || company.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">{company._count.users}</td>
                    <td className="px-6 py-4">
                      <Badge status={company.isActive ? "APPROVED" : "CANCELLED"}>
                        {company.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(company.createdAt)}
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
