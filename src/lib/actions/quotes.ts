"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/auth/require";
import { getCompanySlugForSession } from "@/lib/company-context";
import { generateNextDocumentNumber } from "@/lib/document-number";
import { calculateTotals } from "@/lib/utils";
import { convertToTry } from "@/lib/currency";
import { quoteStatusLabels } from "@/lib/labels";

export async function getQuotePageData() {
  const { prisma } = await requireTenant();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const now = new Date();
  const weekLater = new Date();
  weekLater.setDate(weekLater.getDate() + 7);

  const [quotes, statusGroups, thisMonthCount] = await Promise.all([
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, city: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.quote.groupBy({ by: ["status"], _count: true }),
    prisma.quote.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  const totalValueTry = quotes.reduce(
    (sum, q) => sum + convertToTry(q.total, q.currency, q.exchangeRate),
    0
  );

  const openValueTry = quotes
    .filter((q) => ["DRAFT", "SENT"].includes(q.status))
    .reduce(
      (sum, q) => sum + convertToTry(q.total, q.currency, q.exchangeRate),
      0
    );

  const approvedCount =
    statusGroups.find((g) => g.status === "APPROVED")?._count ?? 0;

  const expiringSoon = quotes.filter(
    (q) =>
      q.validUntil &&
      new Date(q.validUntil) >= now &&
      new Date(q.validUntil) <= weekLater &&
      ["DRAFT", "SENT"].includes(q.status)
  ).length;

  const statusPipeline = statusGroups.map((g) => ({
    status: g.status,
    label: quoteStatusLabels[g.status] ?? g.status,
    count: g._count,
  }));

  return {
    quotes,
    stats: {
      total: quotes.length,
      totalValueTry,
      openValueTry,
      approvedCount,
      thisMonthCount,
      expiringSoon,
      statusPipeline,
    },
  };
}

export async function getQuotes() {
  const { prisma } = await requireTenant();
  return prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: true,
      _count: { select: { items: true } },
    },
  });
}

export async function getQuote(id: string) {
  const { prisma } = await requireTenant();
  return prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { orderBy: { id: "asc" } },
      invoices: {
        orderBy: { issueDate: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          total: true,
          currency: true,
          issueDate: true,
        },
      },
    },
  });
}

export async function createQuote(formData: FormData) {
  const { session, prisma } = await requireTenant();
  const companySlug = await getCompanySlugForSession(session);
  const quoteNumber = await generateNextDocumentNumber(prisma, companySlug, "TEK");

  const customerId = formData.get("customerId") as string;
  const taxRate = parseFloat(formData.get("taxRate") as string) || 20;
  const notes = (formData.get("notes") as string) || null;
  const validUntilStr = formData.get("validUntil") as string;
  const currency = (formData.get("currency") as string) || "TRY";
  const exchangeRate = parseFloat(formData.get("exchangeRate") as string) || 1;

  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson) as {
    description: string;
    detailDescription?: string | null;
    serviceId?: string | null;
    unit: string;
    quantity: number;
    unitPrice: number;
  }[];

  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      customerId,
      taxRate,
      notes,
      validUntil: validUntilStr ? new Date(validUntilStr) : null,
      currency,
      exchangeRate,
      subtotal,
      taxAmount,
      total,
      items: {
        create: items.map((item) => ({
          description: item.description,
          detailDescription: item.detailDescription || null,
          serviceId: item.serviceId || null,
          unit: item.unit || "adet",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
  });

  revalidatePath("/teklifler");
  return quote;
}

export async function updateQuoteStatus(id: string, status: string) {
  const { prisma } = await requireTenant();
  await prisma.quote.update({
    where: { id },
    data: { status: status as "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED" },
  });

  revalidatePath("/teklifler");
  revalidatePath(`/teklifler/${id}`);
}

export async function deleteQuote(id: string) {
  const { prisma } = await requireTenant();
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/teklifler");
}

export async function convertQuoteToInvoice(quoteId: string) {
  const { session, prisma } = await requireTenant();
  const companySlug = await getCompanySlugForSession(session);

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { items: true },
  });

  if (!quote) throw new Error("Teklif bulunamadı");

  const invoiceNumber = await generateNextDocumentNumber(prisma, companySlug, "FTR");

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: quote.customerId,
      quoteId: quote.id,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      total: quote.total,
      currency: quote.currency,
      exchangeRate: quote.exchangeRate,
      dueDate,
      status: "SENT",
      items: {
        create: quote.items.map((item) => ({
          description: item.description,
          detailDescription: item.detailDescription,
          serviceId: item.serviceId,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
  });

  await prisma.transaction.create({
    data: {
      customerId: quote.customerId,
      type: "DEBIT",
      amount: convertToTry(quote.total, quote.currency, quote.exchangeRate),
      description: `Fatura: ${invoiceNumber} (${quote.currency})`,
      referenceType: "INVOICE",
      referenceId: invoice.id,
    },
  });

  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: "APPROVED" },
  });

  revalidatePath("/teklifler");
  revalidatePath("/faturalar");
  revalidatePath(`/musteriler/${quote.customerId}`);

  return invoice;
}
