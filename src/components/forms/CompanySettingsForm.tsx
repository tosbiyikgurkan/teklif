"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Upload, Trash2, Lock, Moon } from "lucide-react";
import {
  updateCompanyProfile,
  removeCompanyLogo,
  removeCompanyLogoLight,
  type CompanyProfile,
} from "@/lib/actions/company-settings";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

type LogoVariant = "default" | "light";

function LogoUploadCard({
  title,
  description,
  previewBg,
  previewPath,
  uploading,
  onUpload,
  onRemove,
  uploadLabel,
}: {
  title: string;
  description: string;
  previewBg: string;
  previewPath: string | null;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  uploadLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className={`flex h-24 w-44 items-center justify-center rounded-xl border-2 border-dashed p-3 ${previewBg}`}
          >
            {previewPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewPath}
                alt="Logo önizleme"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <Building2 className="h-10 w-10 text-slate-400/60" />
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={onUpload}
                disabled={uploading}
              />
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Upload className="h-4 w-4" />
                {uploading ? "Yükleniyor..." : uploadLabel}
              </span>
            </label>
            {previewPath && (
              <Button type="button" variant="secondary" onClick={onRemove}>
                <Trash2 className="h-4 w-4" />
                Kaldır
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanySettingsForm({ profile }: { profile: CompanyProfile }) {
  const router = useRouter();
  const [logoPath, setLogoPath] = useState(profile.logoPath);
  const [logoLightPath, setLogoLightPath] = useState(profile.logoLightPath);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<LogoVariant | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData(e.currentTarget);
      await updateCompanyProfile(formData);
      router.refresh();
    } catch {
      setError("Kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(variant: LogoVariant, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(variant);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (variant === "light") {
        formData.append("variant", "light");
      }

      const res = await fetch("/api/ayarlar/firma/logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız");

      if (variant === "light") {
        setLogoLightPath(data.path);
      } else {
        setLogoPath(data.path);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo yüklenemedi");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  async function handleRemoveLogo(variant: LogoVariant) {
    setError("");
    try {
      if (variant === "light") {
        await removeCompanyLogoLight();
        setLogoLightPath(null);
      } else {
        await removeCompanyLogo();
        setLogoPath(null);
      }
      router.refresh();
    } catch {
      setError("Logo kaldırılamadı");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <LogoUploadCard
        title="Ana Logo"
        description="Sidebar, teklif iç sayfaları ve açık arka planlarda kullanılır. Koyu veya renkli logo yükleyin."
        previewBg="border-slate-200 bg-white"
        previewPath={logoPath}
        uploading={uploading === "default"}
        onUpload={(e) => handleLogoUpload("default", e)}
        onRemove={() => handleRemoveLogo("default")}
        uploadLabel="Ana Logo Yükle"
      />

      <LogoUploadCard
        title="Açık Logo (PDF Kapak)"
        description="PDF kapak sayfasının koyu arka planı için beyaz veya açık renkli logo yükleyin. Yüklemezseniz ana logo kullanılır."
        previewBg="border-slate-600 bg-slate-900"
        previewPath={logoLightPath}
        uploading={uploading === "light"}
        onUpload={(e) => handleLogoUpload("light", e)}
        onRemove={() => handleRemoveLogo("light")}
        uploadLabel="Açık Logo Yükle"
      />

      {!logoLightPath && logoPath && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Moon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            PDF kapakta şu an <strong>ana logo</strong> kullanılıyor. Koyu kapakta logo
            görünmüyorsa yukarıdan açık renkli bir versiyon yükleyin.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Düzenlenebilir Bilgiler</h3>
            <p className="text-sm text-slate-500">
              Bu bilgiler teklif ve fatura belgelerinde görünür.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Firma Adı *"
              name="name"
              defaultValue={profile.name}
              required
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Vergi Numarası"
                name="taxNumber"
                defaultValue={profile.taxNumber || ""}
              />
              <Input
                label="Şehir"
                name="city"
                defaultValue={profile.city || ""}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="E-posta"
                name="email"
                type="email"
                defaultValue={profile.email || ""}
              />
              <Input
                label="Telefon"
                name="phone"
                defaultValue={profile.phone || ""}
              />
            </div>
            <Textarea
              label="Adres"
              name="address"
              rows={3}
              defaultValue={profile.address || ""}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" />
              <h3 className="font-semibold">Kilitli Bilgiler</h3>
            </div>
            <p className="text-sm text-slate-500">
              Sistem bütünlüğü için bu alanlar değiştirilemez. Güncelleme için
              sistem yöneticisiyle iletişime geçin.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Firma Kodu (Slug)
                </p>
                <p className="mt-1 font-mono text-sm text-slate-700">{profile.slug}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Kayıt Tarihi
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Hesap Durumu
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {profile.isActive ? "Aktif" : "Pasif"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Firma ID
                </p>
                <p className="mt-1 truncate font-mono text-xs text-slate-500">
                  {profile.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </form>
    </div>
  );
}
