import type { TenantPrisma } from "@/lib/db/tenant";

export type DocumentType = "TEK" | "FTR";

/** Firma slug'ından belge ön eki üretir: radikal-solar → RAD */
export function companyDocumentCode(slug: string, maxLength = 3): string {
  const normalized = slug.trim().toLowerCase();
  const words = normalized.split(/[-_]+/).filter(Boolean);

  if (words.length >= 2) {
    const acronym = words
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
    if (acronym.length >= 3) {
      return acronym.slice(0, maxLength);
    }
    const primary = words[0].replace(/[^a-z0-9]/g, "");
    return primary.slice(0, maxLength).toUpperCase();
  }

  return normalized.replace(/[^a-z0-9]/g, "").slice(0, maxLength).toUpperCase() || "FRM";
}

function parseSequence(number: string, prefix: string): number | null {
  if (!number.startsWith(prefix)) return null;
  const tail = number.slice(prefix.length);
  if (!/^\d+$/.test(tail)) return null;
  const value = parseInt(tail, 10);
  return Number.isNaN(value) ? null : value;
}

async function maxSequenceForPrefix(
  prisma: TenantPrisma,
  docType: DocumentType,
  prefix: string
): Promise<number> {
  if (docType === "TEK") {
    const rows = await prisma.quote.findMany({
      where: { quoteNumber: { startsWith: prefix } },
      select: { quoteNumber: true },
    });
    return rows.reduce((max, row) => {
      const seq = parseSequence(row.quoteNumber, prefix);
      return seq !== null ? Math.max(max, seq) : max;
    }, 0);
  }

  const rows = await prisma.invoice.findMany({
    where: { invoiceNumber: { startsWith: prefix } },
    select: { invoiceNumber: true },
  });
  return rows.reduce((max, row) => {
    const seq = parseSequence(row.invoiceNumber, prefix);
    return seq !== null ? Math.max(max, seq) : max;
  }, 0);
}

/**
 * Firma bazlı belge numarası: RAD-TEK-2026-0001
 */
export async function generateNextDocumentNumber(
  prisma: TenantPrisma,
  companySlug: string,
  docType: DocumentType,
  date = new Date()
): Promise<string> {
  const year = date.getFullYear();
  const code = companyDocumentCode(companySlug);
  const prefix = `${code}-${docType}-${year}-`;
  const next = (await maxSequenceForPrefix(prisma, docType, prefix)) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export function formatDocumentNumberPreview(
  companySlug: string,
  docType: DocumentType,
  sequence = 1,
  date = new Date()
): string {
  const year = date.getFullYear();
  const code = companyDocumentCode(companySlug);
  return `${code}-${docType}-${year}-${String(sequence).padStart(4, "0")}`;
}
