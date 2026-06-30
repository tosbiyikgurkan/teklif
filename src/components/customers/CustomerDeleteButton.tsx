"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CustomerDeleteButton({
  action,
  disabled = false,
  disabledReason,
}: {
  action: () => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Müşteri silinemedi");
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Müşteri silinemez</p>
        <p className="mt-1 text-xs text-slate-500">
          {disabledReason ?? "Bu müşteriye bağlı kayıtlar var."}
        </p>
      </div>
    );
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="h-4 w-4" />
        Müşteriyi Sil
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">
        Bu müşteriyi silmek istediğinize emin misiniz?
      </p>
      <p className="mt-1 text-xs text-red-600">
        Cari hareketler de silinir. Bu işlem geri alınamaz.
      </p>
      {error && <p className="mt-2 text-xs font-medium text-red-700">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={loading}
          onClick={handleDelete}
          className="flex-1"
        >
          {loading ? "Siliniyor..." : "Evet, Sil"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={loading}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          className="flex-1"
        >
          Vazgeç
        </Button>
      </div>
    </div>
  );
}
