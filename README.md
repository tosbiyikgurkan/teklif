# TeklifPro - Çok Kiracılı İş Yönetim Sistemi

Firma bazlı tekliflendirme, faturalama, cari işlemler ve hizmet takibi platformu.

## Mimari

- **Master DB** (`prisma/master.db`): Firmalar ve kullanıcılar
- **Tenant DB** (`prisma/tenants/{slug}.db`): Her firmanın kendi müşteri, teklif, fatura ve hizmet verileri

## Roller

| Rol | Yetki |
|-----|-------|
| **Sistem Yöneticisi** | Firma oluşturma, tüm kullanıcı yönetimi, admin paneli |
| **Firma Yöneticisi** | Kendi firmasının kullanıcılarını yönetme, tüm modüller |
| **Kullanıcı** | Teklif, fatura, müşteri ve hizmet işlemleri |

## Kurulum

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Demo Hesaplar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Sistem Yöneticisi | admin@teklifpro.com | admin123 |
| Firma Yöneticisi | admin@radikalsolar.com | firma123 |

## Özellikler

- Admin paneli ile firma ve kullanıcı yönetimi
- Firma başına izole SQLite veritabanı
- Oturum tabanlı kimlik doğrulama (JWT cookie)
- Dashboard, müşteriler, teklifler, faturalar, hizmet takibi

## Teknolojiler

- Next.js 16, TypeScript, Tailwind CSS
- Prisma 7 + SQLite (master + tenant)
- bcryptjs, jose (auth)
