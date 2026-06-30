import Link from "next/link";
import { Plus, FileImage } from "lucide-react";
import { getServices } from "@/lib/actions/services";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { parseServicePageContent } from "@/lib/service-page";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div>
      <PageHeader
        title="Hizmet Kataloğu"
        description="Tekliflerde kullanılacak hizmet tanımları"
        action={
          <Button href="/hizmetler/yeni">
            <Plus className="h-4 w-4" />
            Yeni Hizmet
          </Button>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          title="Henüz hizmet tanımı yok"
          description="Hizmet kataloğunuza ilk tanımı ekleyin. Teklif oluştururken bu kalemleri seçebilirsiniz."
          action={
            <Button href="/hizmetler/yeni">
              <Plus className="h-4 w-4" />
              Hizmet Ekle
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-sm text-slate-500">
                  <th className="px-6 py-3 font-medium">Hizmet Adı</th>
                  <th className="px-6 py-3 font-medium">Açıklama</th>
                  <th className="px-6 py-3 font-medium">Birim</th>
                  <th className="px-6 py-3 font-medium text-right">Birim Fiyat</th>
                  <th className="px-6 py-3 font-medium text-center">PDF</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => {
                  const page = parseServicePageContent(service.pageContent);
                  return (
                  <tr
                    key={service.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/hizmetler/${service.id}`}
                        className="font-medium text-slate-900 hover:text-emerald-600"
                      >
                        {service.name}
                      </Link>
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-600">
                      {service.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">{service.unit}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {formatCurrency(service.unitPrice, service.currency)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/hizmetler/${service.id}/sayfa`}
                        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600"
                        title="Teklif PDF sayfası"
                      >
                        <FileImage className="h-4 w-4" />
                        {page.enabled && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                      </Link>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
