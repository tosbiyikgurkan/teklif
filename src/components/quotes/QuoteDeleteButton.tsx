"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function QuoteDeleteButton({ action }: { action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await action();
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
        Teklifi Sil
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">Bu teklifi silmek istediğinize emin misiniz?</p>
      <p className="mt-1 text-xs text-red-600">Bu işlem geri alınamaz.</p>
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
          onClick={() => setConfirming(false)}
          className="flex-1"
        >
          Vazgeç
        </Button>
      </div>
    </div>
  );
}
