import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { getService } from "@/lib/actions/services";
import { getServicePageContent } from "@/lib/actions/service-page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { ServicePageEditor } from "@/components/forms/ServicePageEditor";
import { parseServicePageContent } from "@/lib/service-page";

export default async function ServicePageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, pageData] = await Promise.all([
    getService(id),
    getServicePageContent(id),
  ]);

  if (!service || !pageData) notFound();

  const content = parseServicePageContent(service.pageContent);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/hizmetler/${id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {service.name} — Hizmet Detayı
        </Link>
      </div>

      <PageHeader
        title="Teklif PDF Sayfası"
        description={`${service.name} için kapak sonrası gösterilecek açıklama sayfasını tasarlayın`}
        action={
          <Button href={`/hizmetler/${id}`} variant="secondary">
            <FileText className="h-4 w-4" />
            Hizmet Bilgileri
          </Button>
        }
      />

      <ServicePageEditor
        serviceId={id}
        serviceName={service.name}
        initialContent={content}
      />
    </div>
  );
}
