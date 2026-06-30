import { PrismaClient } from "@/generated/tenant/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { ensureTenantSchema } from "@/lib/db/provision-tenant";

const tenantClients = new Map<string, PrismaClient>();

export function getTenantPrisma(dbPath: string): PrismaClient {
  ensureTenantSchema(dbPath);

  if (!tenantClients.has(dbPath)) {
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    tenantClients.set(dbPath, new PrismaClient({ adapter }));
  }
  return tenantClients.get(dbPath)!;
}

export type TenantPrisma = PrismaClient;
