import { redirect } from "next/navigation";
import { requireCompanyAdmin } from "@/lib/auth/require";
import { getCompanyUsers, createUser, toggleUserStatus } from "@/lib/actions/admin/users";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { roleLabels } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default async function CompanyUsersPage() {
  const session = await requireCompanyAdmin();
  const users = await getCompanyUsers();

  async function handleCreate(formData: FormData) {
    "use server";
    formData.set("companyId", session.companyId!);
    formData.set("role", formData.get("role") as string || "USER");
    await createUser(formData);
    redirect("/ayarlar/kullanicilar");
  }

  return (
    <div>
      <PageHeader
        title="Kullanıcı Yönetimi"
        description={`${session.companyName} firması kullanıcıları`}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold">Mevcut Kullanıcılar</h3>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Ad</th>
                  <th className="px-6 py-3 font-medium">E-posta</th>
                  <th className="px-6 py-3 font-medium">Rol</th>
                  <th className="px-6 py-3 font-medium">Durum</th>
                  <th className="px-6 py-3 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50">
                    <td className="px-6 py-4 text-sm">{user.name}</td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{roleLabels[user.role]}</td>
                    <td className="px-6 py-4">
                      <Badge status={user.isActive ? "APPROVED" : "CANCELLED"}>
                        {user.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.id !== session.userId && user.role !== "COMPANY_ADMIN" && (
                        <form
                          action={async () => {
                            "use server";
                            await toggleUserStatus(user.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            {user.isActive ? "Pasifleştir" : "Aktifleştir"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Yeni Kullanıcı Ekle</h3>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-4">
              <Input label="Ad Soyad" name="name" required />
              <Input label="E-posta" name="email" type="email" required />
              <Input
                label="Şifre"
                name="password"
                type="password"
                minLength={6}
                required
              />
              <Select label="Rol" name="role" defaultValue="USER">
                <option value="USER">Kullanıcı</option>
                <option value="COMPANY_ADMIN">Firma Yöneticisi</option>
              </Select>
              <Button type="submit" className="w-full">
                Kullanıcı Ekle
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
