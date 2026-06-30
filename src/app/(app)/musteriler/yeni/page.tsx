import { redirect } from "next/navigation";
import { createCustomer } from "@/lib/actions/customers";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export default function NewCustomerPage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const customer = await createCustomer(formData);
    redirect(`/musteriler/${customer.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Yeni Müşteri"
        description="Cari hesaba yeni müşteri ekleyin"
      />

      <Card className="max-w-2xl">
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input label="Firma / Kişi Adı *" name="name" required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Vergi No" name="taxNumber" />
              <Input label="Vergi Dairesi" name="taxOffice" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="E-posta" name="email" type="email" />
              <Input label="Telefon" name="phone" type="tel" />
            </div>
            <Input label="Adres" name="address" />
            <Input label="Şehir" name="city" />
            <Textarea label="Notlar" name="notes" rows={3} />

            <div className="flex gap-3 pt-4">
              <Button type="submit">Kaydet</Button>
              <Button href="/musteriler" variant="secondary" type="button">
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
