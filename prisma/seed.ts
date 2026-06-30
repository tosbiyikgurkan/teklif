import "dotenv/config";
import { masterPrisma } from "../src/lib/db/master";
import { hashPassword } from "../src/lib/auth/password";
import { provisionTenantDatabase } from "../src/lib/db/provision-tenant";
import { getTenantPrisma } from "../src/lib/db/tenant";

async function main() {
  const adminPassword = await hashPassword("admin123");

  const superAdmin = await masterPrisma.user.upsert({
    where: { email: "admin@teklifpro.com" },
    update: {},
    create: {
      email: "admin@teklifpro.com",
      passwordHash: adminPassword,
      name: "Sistem Yöneticisi",
      role: "SUPER_ADMIN",
    },
  });

  console.log("Süper admin:", superAdmin.email, "/ şifre: admin123");

  const slug = "radikal-solar";
  let company = await masterPrisma.company.findUnique({ where: { slug } });

  if (!company) {
    const dbPath = provisionTenantDatabase(slug);
    company = await masterPrisma.company.create({
      data: {
        name: "Radikal Solar",
        slug,
        dbPath,
        taxNumber: "1234567890",
        email: "info@radikalsolar.com",
        phone: "0216 555 0000",
        city: "İstanbul",
      },
    });

    const companyAdminPassword = await hashPassword("firma123");
    await masterPrisma.user.create({
      data: {
        email: "admin@radikalsolar.com",
        passwordHash: companyAdminPassword,
        name: "Firma Yöneticisi",
        role: "COMPANY_ADMIN",
        companyId: company.id,
      },
    });

    console.log("Demo firma:", company.name);
    console.log("Firma admin: admin@radikalsolar.com / şifre: firma123");

    const tenant = getTenantPrisma(dbPath);

    const customer = await tenant.customer.create({
      data: {
        name: "ABC Güneş Enerji Ltd.",
        taxNumber: "9876543210",
        email: "info@abcgunes.com",
        phone: "0216 555 1234",
        city: "İstanbul",
      },
    });

    await tenant.service.createMany({
      data: [
        {
          name: "10 kW Güneş Paneli Sistemi",
          description: "Komple güneş enerjisi kurulum paketi",
          unit: "kWp",
          unitPrice: 120000,
        },
        {
          name: "Kurulum ve Devreye Alma",
          description: "Montaj, kablolama ve devreye alma hizmeti",
          unit: "adet",
          unitPrice: 30000,
        },
        {
          name: "Periyodik Bakım",
          description: "Yıllık sistem kontrolü ve bakım",
          unit: "adet",
          unitPrice: 5000,
        },
      ],
    });

    await tenant.quote.create({
      data: {
        quoteNumber: "RAD-TEK-2026-0001",
        customerId: customer.id,
        status: "SENT",
        validUntil: new Date("2026-12-31"),
        subtotal: 150000,
        taxRate: 20,
        taxAmount: 30000,
        total: 180000,
        items: {
          create: [
            {
              description: "10 kW Güneş Paneli Sistemi",
              unit: "kWp",
              quantity: 1,
              unitPrice: 120000,
              total: 120000,
            },
            {
              description: "Kurulum ve Devreye Alma",
              unit: "adet",
              quantity: 1,
              unitPrice: 30000,
              total: 30000,
            },
          ],
        },
      },
    });
  }

  console.log("Seed tamamlandı!");
}

main()
  .catch(console.error)
  .finally(() => masterPrisma.$disconnect());
