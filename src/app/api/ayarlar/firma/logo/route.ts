import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth/session";
import { masterPrisma } from "@/lib/db/master";
import {
  companySlugFromDbPath,
  getCompanyBrandingDir,
  publicPathToAbsolute,
} from "@/lib/uploads";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

const MAX_SIZE = 2 * 1024 * 1024;

type LogoVariant = "default" | "light";

function parseVariant(value: FormDataEntryValue | null): LogoVariant {
  return value === "light" ? "light" : "default";
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.companyId || !session.companyDbPath) {
      return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
    }

    if (session.role !== "COMPANY_ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const variant = parseVariant(formData.get("variant"));

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "JPEG, PNG, WebP veya SVG yükleyebilirsiniz" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya 2 MB'dan küçük olmalı" }, { status: 400 });
    }

    const slug = companySlugFromDbPath(session.companyDbPath);
    const ext =
      file.type === "image/svg+xml"
        ? ".svg"
        : file.type === "image/png"
          ? ".png"
          : file.type === "image/webp"
            ? ".webp"
            : ".jpg";

    const filename = `logo-${variant === "light" ? "light-" : ""}${randomUUID()}${ext}`;
    const dir = getCompanyBrandingDir(slug);

    const company = await masterPrisma.company.findUnique({
      where: { id: session.companyId },
      select: { logoPath: true, logoLightPath: true },
    });

    const oldPath = variant === "light" ? company?.logoLightPath : company?.logoPath;
    if (oldPath) {
      const oldAbs = publicPathToAbsolute(oldPath);
      if (fs.existsSync(oldAbs)) {
        fs.unlinkSync(oldAbs);
      }
    }

    fs.mkdirSync(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(dir, filename), buffer);

    const publicPath = `/uploads/tenants/${slug}/branding/${filename}`;

    await masterPrisma.company.update({
      where: { id: session.companyId },
      data: variant === "light" ? { logoLightPath: publicPath } : { logoPath: publicPath },
    });

    revalidatePath("/", "layout");
    revalidatePath("/ayarlar/firma");

    return NextResponse.json({ path: publicPath, variant });
  } catch {
    return NextResponse.json({ error: "Logo yüklenemedi" }, { status: 500 });
  }
}
