import fs from "fs";
import path from "path";
import { ensureTenantSchema } from "../src/lib/db/provision-tenant";

const tenantsDir = path.join(process.cwd(), "prisma", "tenants");

if (!fs.existsSync(tenantsDir)) {
  console.log("Tenant klasörü bulunamadı.");
  process.exit(0);
}

for (const file of fs.readdirSync(tenantsDir).filter((f) => f.endsWith(".db"))) {
  const dbUrl = `file:${path.join(tenantsDir, file)}`;
  ensureTenantSchema(dbUrl);
  console.log(`Güncellendi: ${file}`);
}

console.log("Tüm tenant veritabanları güncellendi.");
