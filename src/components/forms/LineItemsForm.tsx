"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { convertBetweenCurrencies } from "@/lib/currency";

export type LineItem = {
  description: string;
  detailDescription?: string | null;
  serviceId?: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
};

export type CatalogService = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  currency: string;
  unitPrice: number;
};

export function LineItemsForm({
  items,
  onChange,
  taxRate,
  onTaxRateChange,
  catalog = [],
  quoteCurrency = "TRY",
  exchangeRates = { TRY: 1 },
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  taxRate: number;
  onTaxRateChange: (rate: number) => void;
  catalog?: CatalogService[];
  quoteCurrency?: string;
  exchangeRates?: Record<string, number>;
}) {
  const addItem = () => {
    onChange([...items, { description: "", unit: "adet", quantity: 1, unitPrice: 0 }]);
  };

  const addFromCatalog = (serviceId: string) => {
    const service = catalog.find((s) => s.id === serviceId);
    if (!service) return;

    const unitPrice = convertBetweenCurrencies(
      service.unitPrice,
      service.currency,
      quoteCurrency,
      exchangeRates
    );

    onChange([
      ...items,
      {
        description: service.name,
        detailDescription: service.description || null,
        serviceId: service.id,
        unit: service.unit,
        quantity: 1,
        unitPrice,
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">Kalemler</h3>
        <div className="flex flex-wrap items-center gap-2">
          {catalog.length > 0 && (
            <select
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  addFromCatalog(e.target.value);
                  e.target.value = "";
                }
              }}
            >
              <option value="">Katalogdan ekle...</option>
              {catalog.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.unit} · {formatCurrency(s.unitPrice, s.currency)})
                </option>
              ))}
            </select>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Boş Kalem
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          Katalogdan hizmet seçin veya boş kalem ekleyin.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label={index === 0 ? "Hizmet / Açıklama" : undefined}
                  placeholder="Hizmet adı veya açıklama"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  required
                />
              </div>
              <div className="w-20">
                <Input
                  label={index === 0 ? "Birim" : undefined}
                  value={item.unit}
                  onChange={(e) => updateItem(index, "unit", e.target.value)}
                  required
                />
              </div>
              <div className="w-24">
                <Input
                  label={index === 0 ? "Miktar" : undefined}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", parseFloat(e.target.value) || 0)
                  }
                  required
                />
              </div>
              <div className="w-32">
                <Input
                  label={index === 0 ? "Birim Fiyat" : undefined}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                  }
                  required
                />
              </div>
              <div className="w-28 pb-2 text-right text-sm font-medium text-slate-700">
                {formatCurrency(item.quantity * item.unitPrice, quoteCurrency)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="mb-2 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-slate-200 pt-4">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Ara Toplam</span>
              <span>{formatCurrency(subtotal, quoteCurrency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">KDV (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                  className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <span>{formatCurrency(taxAmount, quoteCurrency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
              <span>Toplam</span>
              <span className="text-emerald-600">{formatCurrency(total, quoteCurrency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
