import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth/session";
import { getTenantPrisma } from "@/lib/db/tenant";
import { companySlugFromDbPath, getServiceUploadDir } from "@/lib/uploads";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.companyDbPath) {
      return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
    }

    const { id: serviceId } = await params;
    const prisma = getTenantPrisma(session.companyDbPath);
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: "Hizmet bulunamadı" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Yalnızca JPEG, PNG, WebP veya GIF yüklenebilir" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya 5 MB'dan küçük olmalı" }, { status: 400 });
    }

    const slug = companySlugFromDbPath(session.companyDbPath);
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${randomUUID()}${ext}`;
    const dir = getServiceUploadDir(slug, serviceId);

    fs.mkdirSync(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(dir, filename), buffer);

    const publicPath = `/uploads/tenants/${slug}/services/${serviceId}/${filename}`;

    return NextResponse.json({
      id: randomUUID(),
      path: publicPath,
    });
  } catch {
    return NextResponse.json({ error: "Görsel yüklenemedi" }, { status: 500 });
  }
}
