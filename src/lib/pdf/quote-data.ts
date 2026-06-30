import { masterPrisma } from "@/lib/db/master";
import { getTenantPrisma } from "@/lib/db/tenant";
import type { SessionPayload } from "@/lib/auth/session";
import { parseServicePageContent } from "@/lib/service-page";
import type { ServicePdfPageData } from "./ServicePdfPage";
import { resolvePdfImageSrc, resolvePdfLogoSrc } from "./image-src";
import { buildBrandPdfPalette, type BrandPdfPalette } from "./logo-colors";

export type QuotePdfData = {
  palette: BrandPdfPalette;
  company: {
    name: string;
    logoPath: string | null;
    logoSrc: string | null;
    logoLightPath: string | null;
    logoLightSrc: string | null;
    themeColor: string;
    taxNumber: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
  };
  customer: {
    name: string;
    taxNumber: string | null;
    taxOffice: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
  };
  quote: {
    quoteNumber: string;
    status: string;
    createdAt: Date;
    validUntil: Date | null;
    notes: string | null;
    currency: string;
    exchangeRate: number;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    items: {
      description: string;
      detailDescription?: string | null;
      unit: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
  };
  preparedBy: string;
  servicePages: ServicePdfPageData[];
};

export async function getQuotePdfData(
  quoteId: string,
  session: SessionPayload
): Promise<QuotePdfData> {
  if (!session.companyId || !session.companyDbPath) {
    throw new Error("Yetkisiz erişim");
  }

  const company = await masterPrisma.company.findUnique({
    where: { id: session.companyId },
  });

  if (!company) {
    throw new Error("Firma bulunamadı");
  }

  const prisma = getTenantPrisma(session.companyDbPath);
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { customer: true, items: { orderBy: { id: "asc" } } },
  });

  if (!quote) {
    throw new Error("Teklif bulunamadı");
  }

  const serviceIds = quote.items
    .map((item) => item.serviceId)
    .filter((id): id is string => Boolean(id));

  const uniqueServiceIds = [...new Set(serviceIds)];

  const services =
    uniqueServiceIds.length > 0
      ? await prisma.service.findMany({
          where: { id: { in: uniqueServiceIds } },
        })
      : [];

  const [logoSrc, logoLightSrc, palette] = await Promise.all([
    resolvePdfLogoSrc(company.logoPath),
    resolvePdfLogoSrc(company.logoLightPath ?? company.logoPath),
    buildBrandPdfPalette(company.logoPath, company.themeColor),
  ]);

  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const servicePages: ServicePdfPageData[] = [];
  const seenServices = new Set<string>();

  for (const item of quote.items) {
    if (!item.serviceId || seenServices.has(item.serviceId)) continue;
    const service = serviceMap.get(item.serviceId);
    if (!service) continue;

    const page = parseServicePageContent(service.pageContent);
    if (!page.enabled) continue;

    const hasContent =
      page.title.trim() ||
      page.subtitle.trim() ||
      page.intro.trim() ||
      page.highlights.some((h) => h.trim()) ||
      page.sections.some((s) => s.title.trim() || s.content.trim()) ||
      page.images.length > 0;

    if (!hasContent) continue;

    seenServices.add(item.serviceId);

    const resolvedImages = await Promise.all(
      page.images.map(async (img) => ({
        id: img.id,
        caption: img.caption,
        src: img.path ? await resolvePdfImageSrc(img.path) : null,
      }))
    );

    servicePages.push({
      companyName: company.name,
      companyLogoSrc: logoSrc,
      palette,
      serviceName: service.name,
      quoteNumber: quote.quoteNumber,
      page: {
        ...page,
        images: resolvedImages,
      },
    });
  }

  return {
    palette,
    company: {
      name: company.name,
      logoPath: company.logoPath,
      logoSrc,
      logoLightPath: company.logoLightPath,
      logoLightSrc,
      themeColor: company.themeColor,
      taxNumber: company.taxNumber,
      email: company.email,
      phone: company.phone,
      address: company.address,
      city: company.city,
    },
    customer: {
      name: quote.customer.name,
      taxNumber: quote.customer.taxNumber,
      taxOffice: quote.customer.taxOffice,
      email: quote.customer.email,
      phone: quote.customer.phone,
      address: quote.customer.address,
      city: quote.customer.city,
    },
    quote: {
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      createdAt: quote.createdAt,
      validUntil: quote.validUntil,
      notes: quote.notes,
      currency: quote.currency,
      exchangeRate: quote.exchangeRate,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      total: quote.total,
      items: quote.items.map((item) => ({
        description: item.description,
        detailDescription: item.detailDescription,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    },
    preparedBy: session.name,
    servicePages,
  };
}
