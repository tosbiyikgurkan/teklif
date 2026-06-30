"use client";

import { Input, Select } from "@/components/ui/Input";
import {
  CURRENCIES,
  BASE_CURRENCY,
  formatCurrency,
  formatExchangeRate,
  convertToTry,
  isForeignCurrency,
} from "@/lib/currency";

type CurrencyFieldsProps = {
  currency: string;
  exchangeRate: number;
  onCurrencyChange: (currency: string) => void;
  onExchangeRateChange: (rate: number) => void;
  subtotal?: number;
};

export function CurrencyFields({
  currency,
  exchangeRate,
  onCurrencyChange,
  onExchangeRateChange,
  subtotal = 0,
}: CurrencyFieldsProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Para Birimi"
          name="currency"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label} ({c.code})
            </option>
          ))}
        </Select>

        {isForeignCurrency(currency) && (
          <Input
            label={`Kur (1 ${currency} = ? ${BASE_CURRENCY})`}
            name="exchangeRate"
            type="number"
            min="0.0001"
            step="0.0001"
            value={exchangeRate}
            onChange={(e) =>
              onExchangeRateChange(parseFloat(e.target.value) || 1)
            }
            required
          />
        )}
      </div>

      {isForeignCurrency(currency) && subtotal > 0 && (
        <p className="mt-3 text-sm text-slate-600">
          Kur: 1 {currency} = {formatExchangeRate(currency, exchangeRate)} ₺ ·
          TRY karşılığı:{" "}
          <span className="font-medium">
            {formatCurrency(convertToTry(subtotal, currency, exchangeRate), BASE_CURRENCY)}
          </span>
        </p>
      )}
    </div>
  );
}
