import { redirect } from "next/navigation";
import { getCompanies } from "@/lib/actions/admin/companies";
import { createUser } from "@/lib/actions/admin/users";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { roleLabels } from "@/lib/labels";

export default async function NewAdminUserPage() {
  const companies = await getCompanies();

  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await createUser(formData);
    if (result?.error) return;
    redirect("/admin/kullanicilar");
  }

  return (
    <div>
      <PageHeader title="Yeni Kullanıcı" description="Platforma yeni kullanıcı ekleyin" />

      <Card className="max-w-xl">
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input label="Ad Soyad *" name="name" required />
            <Input label="E-posta *" name="email" type="email" required />
            <Input
              label="Şifre *"
              name="password"
              type="password"
              minLength={6}
              required
            />
            <Select label="Rol *" name="role" required defaultValue="USER">
              {Object.entries(roleLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
            <Select label="Firma" name="companyId">
              <option value="">Firma seçin (sistem yöneticisi için boş)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <div className="flex gap-3 pt-4">
              <Button type="submit">Kullanıcı Oluştur</Button>
              <Button href="/admin/kullanicilar" variant="secondary">
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
