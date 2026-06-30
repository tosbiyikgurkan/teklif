import { notFound } from "next/navigation";
import { getCompanyProfile } from "@/lib/actions/company-settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompanySettingsForm } from "@/components/forms/CompanySettingsForm";

export default async function CompanySettingsPage() {
  const profile = await getCompanyProfile();
  if (!profile) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Firma Ayarları"
        description="Firma bilgilerinizi ve kurumsal logonuzu yönetin"
      />
      <CompanySettingsForm profile={profile} />
    </div>
  );
}
