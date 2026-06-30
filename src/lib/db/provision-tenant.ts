import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const TENANTS_DIR = path.join(process.cwd(), "prisma", "tenants");

export function getTenantDbPath(slug: string): string {
  return `file:${path.join(TENANTS_DIR, `${slug}.db`)}`;
}

export function provisionTenantDatabase(slug: string): string {
  if (!fs.existsSync(TENANTS_DIR)) {
    fs.mkdirSync(TENANTS_DIR, { recursive: true });
  }

  const dbFilePath = path.join(TENANTS_DIR, `${slug}.db`);
  const dbUrl = `file:${dbFilePath}`;

  if (fs.existsSync(dbFilePath)) {
    migrateTenantSchema(dbFilePath);
    return dbUrl;
  }

  const sqlPath = path.join(process.cwd(), "prisma", "tenant-migration.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  const db = new Database(dbFilePath);
  db.exec(sql);
  db.close();

  return dbUrl;
}

export function resolveTenantDbFilePath(dbUrl: string): string {
  if (!dbUrl.startsWith("file:")) return dbUrl;
  const raw = dbUrl.slice(5);
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
}

export function ensureTenantSchema(dbUrl: string): void {
  const dbFilePath = resolveTenantDbFilePath(dbUrl);
  if (fs.existsSync(dbFilePath)) {
    migrateTenantSchema(dbFilePath);
  }
}

function migrateTenantSchema(dbFilePath: string) {
  const db = new Database(dbFilePath);

  const serviceColumns = db
    .prepare("PRAGMA table_info(Service)")
    .all() as { name: string }[];

  if (serviceColumns.length > 0 && !serviceColumns.some((c) => c.name === "name")) {
    db.exec(`DROP TABLE IF EXISTS "Service";`);
    db.exec(`
      CREATE TABLE "Service" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "unit" TEXT NOT NULL DEFAULT 'adet',
        "currency" TEXT NOT NULL DEFAULT 'TRY',
        "unitPrice" REAL NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `);
  }

  addColumnIfMissing(db, "QuoteItem", "unit", "TEXT NOT NULL DEFAULT 'adet'");
  addColumnIfMissing(db, "QuoteItem", "detailDescription", "TEXT");
  addColumnIfMissing(db, "QuoteItem", "serviceId", "TEXT");
  addColumnIfMissing(db, "InvoiceItem", "unit", "TEXT NOT NULL DEFAULT 'adet'");
  addColumnIfMissing(db, "InvoiceItem", "detailDescription", "TEXT");
  addColumnIfMissing(db, "Quote", "currency", "TEXT NOT NULL DEFAULT 'TRY'");
  addColumnIfMissing(db, "Quote", "exchangeRate", "REAL NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "Invoice", "currency", "TEXT NOT NULL DEFAULT 'TRY'");
  addColumnIfMissing(db, "Invoice", "exchangeRate", "REAL NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "Service", "currency", "TEXT NOT NULL DEFAULT 'TRY'");
  addColumnIfMissing(db, "Service", "pageContent", "TEXT");

  db.close();
}

function addColumnIfMissing(
  db: Database.Database,
  table: string,
  column: string,
  definition: string
) {
  const columns = db
    .prepare(`PRAGMA table_info(${table})`)
    .all() as { name: string }[];

  if (columns.length > 0 && !columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition};`);
  }
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
