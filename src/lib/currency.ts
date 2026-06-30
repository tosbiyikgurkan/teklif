export type CurrencyCode = "TRY" | "USD" | "EUR";

export const CURRENCIES: {
  code: CurrencyCode;
  label: string;
  symbol: string;
}[] = [
  { code: "TRY", label: "Türk Lirası", symbol: "₺" },
  { code: "USD", label: "ABD Doları", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
];

export const BASE_CURRENCY: CurrencyCode = "TRY";

export function isForeignCurrency(currency: string): boolean {
  return currency !== BASE_CURRENCY;
}

export function formatCurrency(
  amount: number,
  currency: string = BASE_CURRENCY
): string {
  const code = CURRENCIES.find((c) => c.code === currency)?.code || BASE_CURRENCY;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatExchangeRate(currency: string, rate: number): string {
  if (currency === BASE_CURRENCY) return "1,00";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(rate);
}

/** 1 birim yabancı para = rate TRY */
export function convertToTry(
  amount: number,
  currency: string,
  exchangeRate: number
): number {
  if (currency === BASE_CURRENCY) return amount;
  return amount * exchangeRate;
}

export function convertBetweenCurrencies(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return amount;
  const toTry = (value: number, cur: string) =>
    cur === BASE_CURRENCY ? value : value * (rates[cur] || 1);
  const fromTry = (value: number, cur: string) =>
    cur === BASE_CURRENCY ? value : value / (rates[cur] || 1);
  return fromTry(toTry(amount, from), to);
}

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dateKey(date: Date = new Date()): string {
  return startOfDay(date).toISOString().slice(0, 10);
}
