import { requireTenant } from "@/lib/auth/require";
import { getServices } from "@/lib/actions/services";
import {
  getCompanyDefaultCurrency,
  getLatestRatesMap,
  seedDefaultRatesIfEmpty,
} from "@/lib/actions/exchange-rates";
import QuoteForm from "./QuoteForm";

export default async function NewQuotePage() {
  await seedDefaultRatesIfEmpty();

  const { prisma } = await requireTenant();
  const [{ defaultCurrency }, latestRates, customers, catalog] = await Promise.all([
    getCompanyDefaultCurrency(),
    getLatestRatesMap(),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getServices(),
  ]);

  return (
    <QuoteForm
      customers={customers}
      catalog={catalog}
      defaultCurrency={defaultCurrency}
      latestRates={latestRates}
    />
  );
}
