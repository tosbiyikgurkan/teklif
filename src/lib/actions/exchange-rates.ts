"use server";

import { revalidatePath } from "next/cache";
import { masterPrisma } from "@/lib/db/master";
import { requireCompanyAdmin, requireSession } from "@/lib/auth/require";
import { BASE_CURRENCY, dateKey, startOfDay, type CurrencyCode } from "@/lib/currency";

const FOREIGN_CURRENCIES: CurrencyCode[] = ["USD", "EUR"];

function parseTcmbRate(xml: string, currencyCode: string): number | null {
  const regex = new RegExp(
    `Currency[^>]*CurrencyCode="${currencyCode}"[^>]*>[\\s\\S]*?<ForexBuying>([\\d.]+)</ForexBuying>`,
    "i"
  );
  const match = xml.match(regex);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
}

export async function fetchTcmbRatesForToday() {
  await requireCompanyAdmin();

  const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("TCMB kur verisi alınamadı");
  }

  const xml = await response.text();
  const today = startOfDay();
  const results: { currency: string; rate: number }[] = [];

  for (const currency of FOREIGN_CURRENCIES) {
    const rate = parseTcmbRate(xml, currency);
    if (!rate) continue;

    await masterPrisma.exchangeRate.upsert({
      where: {
        date_currency: { date: today, currency },
      },
      update: { rate, source: "tcmb" },
      create: { date: today, currency, rate, source: "tcmb" },
    });

    results.push({ currency, rate });
  }

  if (results.length === 0) {
    throw new Error("TCMB yanıtından kur okunamadı");
  }

  revalidatePath("/ayarlar/kurlar");
  return results;
}

export async function getExchangeRates(limit = 30) {
  await requireCompanyAdmin();
  return masterPrisma.exchangeRate.findMany({
    orderBy: [{ date: "desc" }, { currency: "asc" }],
    take: limit,
  });
}

export async function getRatesForDate(date: Date = new Date()) {
  const day = startOfDay(date);
  const rates = await masterPrisma.exchangeRate.findMany({
    where: { date: day },
  });

  const map: Record<string, number> = { [BASE_CURRENCY]: 1 };
  for (const row of rates) {
    map[row.currency] = row.rate;
  }
  return map;
}

export async function getLatestRate(currency: string): Promise<number> {
  if (currency === BASE_CURRENCY) return 1;

  const today = startOfDay();
  let rate = await masterPrisma.exchangeRate.findUnique({
    where: { date_currency: { date: today, currency } },
  });

  if (!rate) {
    rate = await masterPrisma.exchangeRate.findFirst({
      where: { currency },
      orderBy: { date: "desc" },
    });
  }

  return rate?.rate ?? 1;
}

export async function getLatestRatesMap(): Promise<Record<string, number>> {
  const map: Record<string, number> = { [BASE_CURRENCY]: 1 };

  for (const currency of FOREIGN_CURRENCIES) {
    map[currency] = await getLatestRate(currency);
  }

  return map;
}

export async function saveExchangeRate(formData: FormData) {
  await requireCompanyAdmin();

  const currency = formData.get("currency") as string;
  const rate = parseFloat(formData.get("rate") as string);
  const dateStr = formData.get("date") as string;

  if (!currency || currency === BASE_CURRENCY || !rate || rate <= 0) {
    throw new Error("Geçersiz kur bilgisi");
  }

  const date = startOfDay(new Date(dateStr || dateKey()));

  await masterPrisma.exchangeRate.upsert({
    where: { date_currency: { date, currency } },
    update: { rate, source: "manual" },
    create: { date, currency, rate, source: "manual" },
  });

  revalidatePath("/ayarlar/kurlar");
}

export async function updateCompanyDefaultCurrency(formData: FormData) {
  const session = await requireCompanyAdmin();
  if (!session.companyId) throw new Error("Firma bulunamadı");

  const defaultCurrency = formData.get("defaultCurrency") as string;

  await masterPrisma.company.update({
    where: { id: session.companyId },
    data: { defaultCurrency },
  });

  revalidatePath("/ayarlar/kurlar");
}

export async function getCompanyDefaultCurrency() {
  const session = await requireSession();
  if (!session.companyId) return { defaultCurrency: BASE_CURRENCY };

  const company = await masterPrisma.company.findUnique({
    where: { id: session.companyId },
    select: { defaultCurrency: true },
  });

  return { defaultCurrency: company?.defaultCurrency || BASE_CURRENCY };
}

export async function getCompanyCurrencySettings() {
  const session = await requireCompanyAdmin();
  if (!session.companyId) return { defaultCurrency: BASE_CURRENCY };

  const company = await masterPrisma.company.findUnique({
    where: { id: session.companyId },
    select: { defaultCurrency: true },
  });

  return { defaultCurrency: company?.defaultCurrency || BASE_CURRENCY };
}

export async function seedDefaultRatesIfEmpty() {
  const count = await masterPrisma.exchangeRate.count();
  if (count > 0) return;

  const today = startOfDay();
  await masterPrisma.exchangeRate.createMany({
    data: [
      { date: today, currency: "USD", rate: 34.5, source: "manual" },
      { date: today, currency: "EUR", rate: 37.2, source: "manual" },
    ],
  });
}
