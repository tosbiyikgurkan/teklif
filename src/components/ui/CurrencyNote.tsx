import {
  BASE_CURRENCY,
  convertToTry,
  formatCurrency,
  formatExchangeRate,
  isForeignCurrency,
} from "@/lib/currency";

export function CurrencyNote({
  currency,
  exchangeRate,
  total,
}: {
  currency: string;
  exchangeRate: number;
  total: number;
}) {
  if (!isForeignCurrency(currency)) return null;

  return (
    <p className="text-sm text-slate-500">
      Para birimi: {currency} · Kur: 1 {currency} ={" "}
      {formatExchangeRate(currency, exchangeRate)} ₺ · TRY karşılığı:{" "}
      <span className="font-medium text-slate-700">
        {formatCurrency(convertToTry(total, currency, exchangeRate), BASE_CURRENCY)}
      </span>
    </p>
  );
}
