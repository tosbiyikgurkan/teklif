"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, ImageIcon, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { updateServicePageContent } from "@/lib/actions/service-page";
import {
  createId,
  type ServicePageContent,
  type ServicePageImage,
  type ServicePageSection,
} from "@/lib/service-page";

export function ServicePageEditor({
  serviceId,
  serviceName,
  initialContent,
}: {
  serviceId: string;
  serviceName: string;
  initialContent: ServicePageContent;
}) {
  const router = useRouter();
  const [content, setContent] = useState<ServicePageContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await updateServicePageContent(serviceId, content);
      router.refresh();
    } catch {
      setError("Kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/hizmetler/${serviceId}/gorsel`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız");

      const image: ServicePageImage = {
        id: data.id,
        path: data.path,
        caption: "",
      };

      setContent((prev) => ({
        ...prev,
        images: [...prev.images, image],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function updateHighlight(index: number, value: string) {
    setContent((prev) => {
      const highlights = [...prev.highlights];
      highlights[index] = value;
      return { ...prev, highlights };
    });
  }

  function addHighlight() {
    setContent((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ""],
    }));
  }

  function removeHighlight(index: number) {
    setContent((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  }

  function updateSection(id: string, field: keyof ServicePageSection, value: string) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  }

  function addSection() {
    setContent((prev) => ({
      ...prev,
      sections: [...prev.sections, { id: createId(), title: "", content: "" }],
    }));
  }

  function removeSection(id: string) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  }

  function updateImage(id: string, field: keyof ServicePageImage, value: string) {
    setContent((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === id ? { ...img, [field]: value } : img
      ),
    }));
  }

  function removeImage(id: string) {
    setContent((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="font-semibold">PDF Sayfa Ayarları</h3>
          <p className="text-sm text-slate-500">
            Bu hizmet teklife eklendiğinde kapaktan sonra açıklama sayfası olarak
            gösterilir.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={content.enabled}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, enabled: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Teklif PDF&apos;inde hizmet açıklama sayfası göster
            </span>
          </label>

          <Input
            label="Sayfa Başlığı"
            placeholder={serviceName}
            value={content.title}
            onChange={(e) =>
              setContent((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <Input
            label="Alt Başlık"
            placeholder="Kısa tanıtım cümlesi"
            value={content.subtitle}
            onChange={(e) =>
              setContent((prev) => ({ ...prev, subtitle: e.target.value }))
            }
          />
          <Textarea
            label="Giriş Metni"
            placeholder="Hizmetin genel tanımı ve kapsamı..."
            rows={4}
            value={content.intro}
            onChange={(e) =>
              setContent((prev) => ({ ...prev, intro: e.target.value }))
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Öne Çıkanlar</h3>
            <Button type="button" variant="secondary" size="sm" onClick={addHighlight}>
              <Plus className="h-4 w-4" />
              Madde Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.highlights.length === 0 ? (
            <p className="text-sm text-slate-500">
              Avantajlar, kapsam maddeleri veya teknik özellikler ekleyin.
            </p>
          ) : (
            content.highlights.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                <Input
                  placeholder="Örn: 25 yıl performans garantisi"
                  value={item}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Görseller</h3>
              <p className="text-sm text-slate-500">JPEG, PNG, WebP · Maks. 5 MB</p>
            </div>
            <label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Upload className="h-4 w-4" />
                {uploading ? "Yükleniyor..." : "Görsel Yükle"}
              </span>
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {content.images.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12 text-slate-400">
              <ImageIcon className="mb-2 h-10 w-10" />
              <p className="text-sm">Henüz görsel eklenmedi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {content.images.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="relative aspect-video bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.path}
                      alt={img.caption || "Hizmet görseli"}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute right-2 top-2 rounded bg-white/90 p-1.5 text-red-600 shadow hover:bg-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <Input
                      placeholder="Görsel açıklaması (isteğe bağlı)"
                      value={img.caption || ""}
                      onChange={(e) => updateImage(img.id, "caption", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">İçerik Bölümleri</h3>
            <Button type="button" variant="secondary" size="sm" onClick={addSection}>
              <Plus className="h-4 w-4" />
              Bölüm Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {content.sections.length === 0 ? (
            <p className="text-sm text-slate-500">
              Teknik detaylar, kapsam açıklaması veya ek bilgiler için bölümler ekleyin.
            </p>
          ) : (
            content.sections.map((section) => (
              <div
                key={section.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Bölüm
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <Input
                    label="Bölüm Başlığı"
                    placeholder="Örn: Teknik Özellikler"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(section.id, "title", e.target.value)
                    }
                  />
                  <Textarea
                    label="İçerik"
                    placeholder="Detaylı açıklama..."
                    rows={4}
                    value={section.content}
                    onChange={(e) =>
                      updateSection(section.id, "content", e.target.value)
                    }
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Sayfayı Kaydet"}
        </Button>
        <Button href={`/hizmetler/${serviceId}`} variant="secondary">
          Geri Dön
        </Button>
      </div>
    </div>
  );
}
