import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllUsers } from "@/lib/actions/admin/users";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { roleLabels } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { toggleUserStatus, deleteUser } from "@/lib/actions/admin/users";

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div>
      <PageHeader
        title="Kullanıcılar"
        description="Tüm platform kullanıcıları"
        action={
          <Button href="/admin/kullanicilar/yeni">
            <Plus className="h-4 w-4" />
            Yeni Kullanıcı
          </Button>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          title="Henüz kullanıcı yok"
          description="İlk kullanıcıyı ekleyin."
          action={
            <Button href="/admin/kullanicilar/yeni">
              <Plus className="h-4 w-4" />
              Kullanıcı Ekle
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Ad</th>
                  <th className="px-6 py-3 font-medium">E-posta</th>
                  <th className="px-6 py-3 font-medium">Rol</th>
                  <th className="px-6 py-3 font-medium">Firma</th>
                  <th className="px-6 py-3 font-medium">Durum</th>
                  <th className="px-6 py-3 font-medium">Kayıt</th>
                  <th className="px-6 py-3 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50">
                    <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{roleLabels[user.role]}</td>
                    <td className="px-6 py-4 text-sm">
                      {user.company?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={user.isActive ? "APPROVED" : "CANCELLED"}>
                        {user.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
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
                        {user.role !== "SUPER_ADMIN" && (
                          <form
                            action={async () => {
                              "use server";
                              await deleteUser(user.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Sil
                            </button>
                          </form>
                        )}
                      </div>
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
