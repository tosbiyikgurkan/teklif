"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/auth/require";
import {
  parseServicePageContent,
  serializeServicePageContent,
  type ServicePageContent,
} from "@/lib/service-page";

export async function getServicePageContent(serviceId: string) {
  const { prisma } = await requireTenant();
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { id: true, name: true, pageContent: true },
  });
  if (!service) return null;

  return {
    id: service.id,
    name: service.name,
    content: parseServicePageContent(service.pageContent),
  };
}

export async function updateServicePageContent(
  serviceId: string,
  content: ServicePageContent
) {
  const { prisma } = await requireTenant();

  await prisma.service.update({
    where: { id: serviceId },
    data: { pageContent: serializeServicePageContent(content) },
  });

  revalidatePath(`/hizmetler/${serviceId}`);
  revalidatePath(`/hizmetler/${serviceId}/sayfa`);
}
