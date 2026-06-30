"use server";

import { requireTenant } from "@/lib/auth/require";
import { convertToTry } from "@/lib/currency";
import { quoteStatusLabels, invoiceStatusLabels } from "@/lib/labels";

function startOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("tr-TR", { month: "short", year: "2-digit" }).format(d);
}

export async function getDashboardStats() {
  const { prisma } = await requireTenant();
  const monthStart = startOfMonth();

  const [
    customerCount,
    quoteCount,
    invoiceCount,
    serviceCount,
    recentQuotes,
    recentInvoices,
    catalogServices,
    allTransactions,
    allInvoices,
    pendingInvoicesList,
    quoteStatusGroups,
    invoiceStatusGroups,
    overdueCount,
    newCustomersThisMonth,
    newQuotesThisMonth,
    paidInvoicesThisMonth,
    allQuotesForTotal,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.quote.count(),
    prisma.invoice.count(),
    prisma.service.count(),
    prisma.quote.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.service.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany(),
    prisma.invoice.findMany({
      select: {
        paidAmount: true,
        total: true,
        currency: true,
        exchangeRate: true,
        issueDate: true,
      },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["SENT", "PARTIAL", "OVERDUE"] } },
      select: { total: true, currency: true, exchangeRate: true },
    }),
    prisma.quote.groupBy({ by: ["status"], _count: true }),
    prisma.invoice.groupBy({ by: ["status"], _count: true }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.quote.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.invoice.findMany({
      where: { issueDate: { gte: monthStart } },
      select: { paidAmount: true, currency: true, exchangeRate: true },
    }),
    prisma.quote.findMany({
      select: { total: true, currency: true, exchangeRate: true, status: true },
    }),
  ]);

  const totalRevenue = allInvoices.reduce(
    (sum, inv) =>
      sum + convertToTry(inv.paidAmount, inv.currency, inv.exchangeRate),
    0
  );

  const totalInvoiced = allInvoices.reduce(
    (sum, inv) => sum + convertToTry(inv.total, inv.currency, inv.exchangeRate),
    0
  );

  const pendingInvoiceTotal = pendingInvoicesList.reduce(
    (sum, inv) => sum + convertToTry(inv.total, inv.currency, inv.exchangeRate),
    0
  );

  const totalReceivable = allTransactions.reduce((sum, t) => {
    return t.type === "DEBIT" ? sum + t.amount : sum - t.amount;
  }, 0);

  const thisMonthRevenue = paidInvoicesThisMonth.reduce(
    (sum, inv) =>
      sum + convertToTry(inv.paidAmount, inv.currency, inv.exchangeRate),
    0
  );

  const openQuoteValue = allQuotesForTotal
    .filter((q) => ["DRAFT", "SENT"].includes(q.status))
    .reduce(
      (sum, q) => sum + convertToTry(q.total, q.currency, q.exchangeRate),
      0
    );

  const approvedQuoteCount =
    quoteStatusGroups.find((g) => g.status === "APPROVED")?._count ?? 0;

  const collectionRate =
    totalInvoiced > 0 ? Math.round((totalRevenue / totalInvoiced) * 100) : 0;

  const monthlyMap = new Map<string, number>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap.set(monthKey(d), 0);
  }

  for (const inv of allInvoices) {
    const key = monthKey(new Date(inv.issueDate));
    if (!monthlyMap.has(key)) continue;
    monthlyMap.set(
      key,
      (monthlyMap.get(key) ?? 0) +
        convertToTry(inv.paidAmount, inv.currency, inv.exchangeRate)
    );
  }

  const monthlyRevenue = [...monthlyMap.entries()].map(([key, amount]) => ({
    label: monthLabel(key),
    amount,
  }));

  const maxMonthly = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

  const quotePipeline = quoteStatusGroups.map((g) => ({
    status: g.status,
    label: quoteStatusLabels[g.status as keyof typeof quoteStatusLabels] ?? g.status,
    count: g._count,
  }));

  const invoiceSummary = invoiceStatusGroups.map((g) => ({
    status: g.status,
    label: invoiceStatusLabels[g.status as keyof typeof invoiceStatusLabels] ?? g.status,
    count: g._count,
  }));

  const recentActivity = [
    ...recentQuotes.map((q) => ({
      id: q.id,
      type: "quote" as const,
      title: q.quoteNumber,
      subtitle: q.customer.name,
      amount: q.total,
      currency: q.currency,
      status: q.status,
      date: q.createdAt,
      href: `/teklifler/${q.id}`,
    })),
    ...recentInvoices.map((inv) => ({
      id: inv.id,
      type: "invoice" as const,
      title: inv.invoiceNumber,
      subtitle: inv.customer.name,
      amount: inv.total,
      currency: inv.currency,
      status: inv.status,
      date: inv.createdAt,
      href: `/faturalar/${inv.id}`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  return {
    customerCount,
    quoteCount,
    invoiceCount,
    serviceCount,
    totalRevenue,
    totalInvoiced,
    pendingInvoiceCount: pendingInvoicesList.length,
    pendingInvoiceTotal,
    totalReceivable,
    overdueCount,
    thisMonthRevenue,
    newCustomersThisMonth,
    newQuotesThisMonth,
    openQuoteValue,
    approvedQuoteCount,
    collectionRate,
    monthlyRevenue,
    maxMonthly,
    quotePipeline,
    invoiceSummary,
    recentQuotes,
    recentInvoices,
    catalogServices,
    recentActivity,
  };
}
