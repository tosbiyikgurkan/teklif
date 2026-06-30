import { redirect } from "next/navigation";
import { createCompany } from "@/lib/actions/admin/companies";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewCompanyPage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const company = await createCompany(formData);
    redirect(`/admin/firmalar/${company.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Yeni Firma"
        description="Yeni firma kaydı oluşturun. Otomatik olarak ayrı veritabanı oluşturulur."
      />

      <Card className="max-w-2xl">
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Firma Bilgileri
              </h3>
              <div className="space-y-4">
                <Input label="Firma Adı *" name="name" required />
                <Input
                  label="Slug (boş bırakılırsa otomatik)"
                  name="slug"
                  placeholder="ornek-firma"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Vergi No" name="taxNumber" />
                  <Input label="Şehir" name="city" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="E-posta" name="email" type="email" />
                  <Input label="Telefon" name="phone" type="tel" />
                </div>
                <Input label="Adres" name="address" />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Firma Yöneticisi (isteğe bağlı)
              </h3>
              <div className="space-y-4">
                <Input label="Yönetici Adı" name="adminName" />
                <Input label="Yönetici E-posta" name="adminEmail" type="email" />
                <Input
                  label="Yönetici Şifre"
                  name="adminPassword"
                  type="password"
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Firma Oluştur</Button>
              <Button href="/admin/firmalar" variant="secondary">
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
