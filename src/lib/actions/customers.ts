"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/auth/require";

function computeBalance(
  transactions: { type: string; amount: number }[]
): number {
  return transactions.reduce(
    (sum, t) => (t.type === "DEBIT" ? sum + t.amount : sum - t.amount),
    0
  );
}

export async function getCustomerPageData() {
  const { prisma } = await requireTenant();

  const [customers, allTransactions] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { quotes: true, invoices: true, transactions: true },
        },
      },
    }),
    prisma.transaction.findMany({
      select: { customerId: true, type: true, amount: true },
    }),
  ]);

  const balanceMap = new Map<string, number>();
  for (const tx of allTransactions) {
    const current = balanceMap.get(tx.customerId) ?? 0;
    balanceMap.set(
      tx.customerId,
      tx.type === "DEBIT" ? current + tx.amount : current - tx.amount
    );
  }

  const enriched = customers.map((c) => ({
    ...c,
    balance: balanceMap.get(c.id) ?? 0,
  }));

  const totalReceivable = enriched.reduce(
    (sum, c) => sum + Math.max(0, c.balance),
    0
  );
  const totalCredit = enriched.reduce(
    (sum, c) => sum + Math.max(0, -c.balance),
    0
  );
  const debtorCount = enriched.filter((c) => c.balance > 0).length;
  const creditorCount = enriched.filter((c) => c.balance < 0).length;
  const activeCount = enriched.filter(
    (c) => c._count.quotes > 0 || c._count.invoices > 0
  ).length;

  return {
    customers: enriched,
    stats: {
      total: enriched.length,
      totalReceivable,
      totalCredit,
      debtorCount,
      creditorCount,
      activeCount,
      totalQuotes: enriched.reduce((s, c) => s + c._count.quotes, 0),
      totalInvoices: enriched.reduce((s, c) => s + c._count.invoices, 0),
    },
  };
}

export async function getCustomers() {
  const { customers } = await getCustomerPageData();
  return customers;
}

export async function getCustomer(id: string) {
  const { prisma } = await requireTenant();

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: {
        select: { quotes: true, invoices: true, transactions: true },
      },
      transactions: { orderBy: { date: "desc" } },
      quotes: { orderBy: { createdAt: "desc" }, take: 5 },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!customer) return null;

  const balance = computeBalance(customer.transactions);

  const quoteTotal = customer.quotes.reduce((s, q) => s + q.total, 0);
  const invoiceTotal = customer.invoices.reduce((s, inv) => s + inv.total, 0);
  const paidTotal = customer.invoices.reduce((s, inv) => s + inv.paidAmount, 0);

  return {
    ...customer,
    balance,
    quoteTotal,
    invoiceTotal,
    paidTotal,
  };
}

export async function createCustomer(formData: FormData) {
  const { prisma } = await requireTenant();

  const customer = await prisma.customer.create({
    data: {
      name: formData.get("name") as string,
      taxNumber: (formData.get("taxNumber") as string) || null,
      taxOffice: (formData.get("taxOffice") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      city: (formData.get("city") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath("/musteriler");
  return customer;
}

export async function updateCustomer(id: string, formData: FormData) {
  const { prisma } = await requireTenant();

  await prisma.customer.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      taxNumber: (formData.get("taxNumber") as string) || null,
      taxOffice: (formData.get("taxOffice") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      city: (formData.get("city") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath("/musteriler");
  revalidatePath(`/musteriler/${id}`);
}

export async function deleteCustomer(id: string) {
  const { prisma } = await requireTenant();

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: { select: { quotes: true, invoices: true } },
    },
  });

  if (!customer) {
    throw new Error("Müşteri bulunamadı");
  }

  if (customer._count.quotes > 0 || customer._count.invoices > 0) {
    throw new Error(
      "Bu müşteriye bağlı teklif veya fatura olduğu için silinemez. Önce ilişkili kayıtları kaldırın."
    );
  }

  await prisma.customer.delete({ where: { id } });
  revalidatePath("/musteriler");
}

export async function addTransaction(formData: FormData) {
  const { prisma } = await requireTenant();

  const customerId = formData.get("customerId") as string;
  const type = formData.get("type") as "DEBIT" | "CREDIT";
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;

  await prisma.transaction.create({
    data: { customerId, type, amount, description },
  });

  revalidatePath(`/musteriler/${customerId}`);
  revalidatePath("/musteriler");
}
