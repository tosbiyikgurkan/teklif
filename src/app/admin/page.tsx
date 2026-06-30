import Link from "next/link";
import { Plus, Building2, Users, Shield } from "lucide-react";
import { getAdminStats } from "@/lib/actions/admin/users";
import { getCompanies } from "@/lib/actions/admin/companies";
import { PageHeader, StatCard } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [stats, companies] = await Promise.all([
    getAdminStats(),
    getCompanies(),
  ]);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Platform genelinde firma ve kullanıcı yönetimi"
        action={
          <Button href="/admin/firmalar/yeni">
            <Plus className="h-4 w-4" />
            Yeni Firma
          </Button>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Toplam Firma"
          value={String(stats.companyCount)}
          icon={Building2}
        />
        <StatCard
          title="Aktif Firma"
          value={String(stats.activeCompanies)}
          icon={Shield}
        />
        <StatCard
          title="Toplam Kullanıcı"
          value={String(stats.userCount)}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Kayıtlı Firmalar</h2>
            <Button href="/admin/firmalar" variant="ghost" size="sm">
              Tümü
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {companies.length === 0 ? (
            <p className="px-6 py-4 text-sm text-slate-500">Henüz firma yok.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Firma</th>
                  <th className="px-6 py-3 font-medium">Slug</th>
                  <th className="px-6 py-3 font-medium">Kullanıcı</th>
                  <th className="px-6 py-3 font-medium">Durum</th>
                  <th className="px-6 py-3 font-medium">Kayıt</th>
                </tr>
              </thead>
              <tbody>
                {companies.slice(0, 10).map((company) => (
                  <tr key={company.id} className="border-b border-slate-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/firmalar/${company.id}`}
                        className="font-medium hover:text-violet-600"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {company.slug}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
