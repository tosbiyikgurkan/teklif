import { getCompanyTheme } from "@/lib/actions/theme";
import { PageHeader } from "@/components/ui/PageHeader";
import { ThemePicker } from "@/components/theme/ThemePicker";

export default async function ThemeSettingsPage() {
  const theme = await getCompanyTheme();

  return (
    <div>
      <PageHeader
        title="Tema Ayarları"
        description="Firmanızın arayüz vurgu rengini özelleştirin"
      />
      <ThemePicker currentColor={theme.color} />
    </div>
  );
}
