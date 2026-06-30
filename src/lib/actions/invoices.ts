"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/auth/require";
import { getCompanySlugForSession } from "@/lib/company-context";
import { generateNextDocumentNumber } from "@/lib/document-number";
import { calculateTotals } from "@/lib/utils";
import { convertToTry } from "@/lib/currency";

export async function getInvoices() {
  const { prisma } = await requireTenant();
  return prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      _count: { select: { items: true, payments: true } },
    },
  });
}

export async function getInvoice(id: string) {
  const { prisma } = await requireTenant();
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { paymentDate: "desc" } },
      quote: true,
    },
  });
}

export async function createInvoice(formData: FormData) {
  const { session, prisma } = await requireTenant();
  const companySlug = await getCompanySlugForSession(session);
  const invoiceNumber = await generateNextDocumentNumber(prisma, companySlug, "FTR");

  const customerId = formData.get("customerId") as string;
  const taxRate = parseFloat(formData.get("taxRate") as string) || 20;
  const notes = (formData.get("notes") as string) || null;
  const dueDateStr = formData.get("dueDate") as string;
  const currency = (formData.get("currency") as string) || "TRY";
  const exchangeRate = parseFloat(formData.get("exchangeRate") as string) || 1;

  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson) as {
    description: string;
    detailDescription?: string | null;
    unit: string;
    quantity: number;
    unitPrice: number;
  }[];

  const { subtotal, taxAmount, total } = calculateTotals(items, taxRate);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId,
      taxRate,
      notes,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      currency,
      exchangeRate,
      subtotal,
      taxAmount,
      total,
      status: "SENT",
      items: {
        create: items.map((item) => ({
          description: item.description,
          detailDescription: item.detailDescription || null,
          unit: item.unit || "adet",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
  });

  await prisma.transaction.create({
    data: {
      customerId,
      type: "DEBIT",
      amount: convertToTry(total, currency, exchangeRate),
      description: `Fatura: ${invoiceNumber} (${currency})`,
      referenceType: "INVOICE",
      referenceId: invoice.id,
    },
  });

  revalidatePath("/faturalar");
  revalidatePath(`/musteriler/${customerId}`);
  return invoice;
}

export async function addPayment(formData: FormData) {
  const { prisma } = await requireTenant();

  const invoiceId = formData.get("invoiceId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const method = (formData.get("method") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) throw new Error("Fatura bulunamadı");

  await prisma.payment.create({
    data: { invoiceId, amount, method, notes },
  });

  const newPaidAmount = invoice.paidAmount + amount;
  let status: "PAID" | "PARTIAL" | "SENT" = "PARTIAL";
  if (newPaidAmount >= invoice.total) status = "PAID";
  else if (newPaidAmount === 0) status = "SENT";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { paidAmount: newPaidAmount, status },
  });

  await prisma.transaction.create({
    data: {
      customerId: invoice.customerId,
      type: "CREDIT",
      amount: convertToTry(amount, invoice.currency, invoice.exchangeRate),
      description: `Ödeme: ${invoice.invoiceNumber} (${invoice.currency})`,
      referenceType: "PAYMENT",
      referenceId: invoiceId,
    },
  });

  revalidatePath("/faturalar");
  revalidatePath(`/faturalar/${invoiceId}`);
  revalidatePath(`/musteriler/${invoice.customerId}`);
}

export async function deleteInvoice(id: string) {
  const { prisma } = await requireTenant();
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/faturalar");
}
