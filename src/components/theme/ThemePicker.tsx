"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { THEME_PRESETS } from "@/lib/theme";
import { updateCompanyTheme } from "@/lib/actions/theme";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export function ThemePicker({ currentColor }: { currentColor: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentColor);
  const [custom, setCustom] = useState(currentColor);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const formData = new FormData();
    formData.set("themeColor", selected);
    try {
      await updateCompanyTheme(formData);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function pickPreset(color: string) {
    setSelected(color);
    setCustom(color);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Hazır Temalar</h3>
          <p className="text-sm text-slate-500">
            Sidebar, butonlar ve vurgu renkleri firma genelinde güncellenir.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                onClick={() => pickPreset(preset.color)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  selected === preset.color
                    ? "border-[var(--theme-primary)] bg-[var(--theme-primary-light)]/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span
                  className="h-10 w-10 rounded-full shadow-inner ring-2 ring-white"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="text-xs font-medium text-slate-700">{preset.name}</span>
                {selected === preset.color && (
                  <Check
                    className="absolute right-2 top-2 h-4 w-4 text-[var(--theme-primary)]"
                  />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Özel Renk</h3>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Renk seçici
            </label>
            <input
              type="color"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setSelected(e.target.value);
              }}
              className="h-11 w-20 cursor-pointer rounded-lg border border-slate-300"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              HEX kodu
            </label>
            <input
              type="text"
              value={custom}
              onChange={(e) => {
                const v = e.target.value;
                setCustom(v);
                if (/^#[0-9a-fA-F]{6}$/.test(v)) setSelected(v);
              }}
              className="focus-theme w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="#059669"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Önizleme</h3>
        </CardHeader>
        <CardContent>
          <div
            className="overflow-hidden rounded-xl border border-slate-200"
            style={
              {
                "--theme-primary": selected,
                "--theme-primary-hover": selected,
                "--theme-primary-light": `${selected}18`,
                "--theme-primary-muted": `${selected}30`,
              } as React.CSSProperties
            }
          >
            <div className="flex gap-4 bg-slate-900 p-4">
              <div
                className="h-10 w-10 rounded-lg"
                style={{ backgroundColor: selected }}
              />
              <div className="space-y-2">
                <div
                  className="inline-block rounded-lg px-3 py-1.5 text-sm font-medium text-white"
                  style={{ backgroundColor: selected }}
                >
                  Aktif menü
                </div>
                <button
                  type="button"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: selected }}
                >
                  Birincil Buton
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="button" onClick={handleSave} disabled={saving}>
        {saving ? "Kaydediliyor..." : "Temayı Kaydet"}
      </Button>
    </div>
  );
}
