import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileImage } from "lucide-react";
import { getService, updateService, deleteService } from "@/lib/actions/services";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { unitOptions } from "@/lib/units";
import { CURRENCIES } from "@/lib/currency";
import { parseServicePageContent } from "@/lib/service-page";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) notFound();

  const pageContent = parseServicePageContent(service.pageContent);

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateService(id, formData);
    redirect(`/hizmetler/${id}`);
  }

  async function handleDelete() {
    "use server";
    await deleteService(id);
    redirect("/hizmetler");
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/hizmetler"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Hizmet Kataloğuna Dön
        </Link>
      </div>

      <PageHeader
        title={service.name}
        description={`${service.unit} · ${formatCurrency(service.unitPrice, service.currency)}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <form action={handleUpdate} className="space-y-4">
              <Input label="Hizmet Adı *" name="name" defaultValue={service.name} required />
              <Textarea
                label="Açıklama"
                name="description"
                rows={3}
                defaultValue={service.description || ""}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Birim *" name="unit" defaultValue={service.unit} required>
                  {unitOptions.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Para Birimi *"
                  name="currency"
                  defaultValue={service.currency}
                  required
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </option>
                  ))}
                </Select>
              </div>
              <Input
                label="Birim Fiyat *"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={service.unitPrice}
                required
              />
              <Button type="submit">Güncelle</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <Button href={`/hizmetler/${id}/sayfa`} className="w-full">
              <FileImage className="h-4 w-4" />
              Teklif PDF Sayfası
            </Button>
            {pageContent.enabled && (
              <p className="text-center text-xs text-emerald-600">
                PDF açıklama sayfası aktif
              </p>
            )}
            <form action={handleDelete}>
              <Button type="submit" variant="danger" className="w-full">
                Hizmeti Sil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
