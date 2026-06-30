import { redirect } from "next/navigation";
import { createService } from "@/lib/actions/services";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { unitOptions } from "@/lib/units";
import { CURRENCIES } from "@/lib/currency";

export default function NewServicePage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const service = await createService(formData);
    redirect(`/hizmetler/${service.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Yeni Hizmet"
        description="Tekliflerde kalem olarak kullanılacak hizmet tanımı oluşturun"
      />

      <Card className="max-w-2xl">
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input label="Hizmet Adı *" name="name" required />
            <Textarea label="Açıklama" name="description" rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Birim *" name="unit" defaultValue="adet" required>
                {unitOptions.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </Select>
              <Select label="Para Birimi *" name="currency" defaultValue="TRY" required>
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
              required
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit">Kaydet</Button>
              <Button href="/hizmetler" variant="secondary">
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
