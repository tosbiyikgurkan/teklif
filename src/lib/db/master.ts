import { PrismaClient } from "@/generated/master/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForMaster = globalThis as unknown as {
  masterPrisma: PrismaClient | undefined;
};

function createMasterClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.MASTER_DATABASE_URL || "file:./prisma/master.db",
  });
  return new PrismaClient({ adapter });
}

export const masterPrisma =
  globalForMaster.masterPrisma ?? createMasterClient();

if (process.env.NODE_ENV !== "production") {
  globalForMaster.masterPrisma = masterPrisma;
}
