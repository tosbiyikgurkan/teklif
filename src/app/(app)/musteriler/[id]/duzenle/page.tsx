import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCustomer, updateCustomer } from "@/lib/actions/customers";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  async function handleSubmit(formData: FormData) {
    "use server";
    await updateCustomer(id, formData);
    redirect(`/musteriler/${id}`);
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/musteriler/${id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--theme-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Müşteri Detayına Dön
        </Link>
      </div>

      <PageHeader
        title="Müşteriyi Düzenle"
        description={customer.name}
      />

      <Card className="max-w-2xl">
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input label="Firma / Kişi Adı *" name="name" defaultValue={customer.name} required />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Vergi No"
                name="taxNumber"
                defaultValue={customer.taxNumber ?? ""}
              />
              <Input
                label="Vergi Dairesi"
                name="taxOffice"
                defaultValue={customer.taxOffice ?? ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="E-posta"
                name="email"
                type="email"
                defaultValue={customer.email ?? ""}
              />
              <Input
                label="Telefon"
                name="phone"
                type="tel"
                defaultValue={customer.phone ?? ""}
              />
            </div>
            <Input label="Adres" name="address" defaultValue={customer.address ?? ""} />
            <Input label="Şehir" name="city" defaultValue={customer.city ?? ""} />
            <Textarea label="Notlar" name="notes" rows={3} defaultValue={customer.notes ?? ""} />

            <div className="flex gap-3 pt-4">
              <Button type="submit">Güncelle</Button>
              <Button href={`/musteriler/${id}`} variant="secondary" type="button">
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
