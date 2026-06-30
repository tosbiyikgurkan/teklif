import fs from "fs";
import path from "path";
import sharp from "sharp";
import { absolutePathExists, publicPathToAbsolute } from "@/lib/uploads";

/** PNG olarak kaydeder, alfa kanalını korur (şeffaf arka plan). */
async function toPngDataUriPreserveAlpha(absPath: string): Promise<string> {
  const png = await sharp(absPath, { density: 240 })
    .ensureAlpha()
    .png({ compressionLevel: 6 })
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** Fotoğraflar için — düz arka plan yeterli. */
async function toPngDataUri(absPath: string): Promise<string> {
  const png = await sharp(absPath, { density: 220 }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

function toDataUri(absPath: string): string {
  const ext = path.extname(absPath).toLowerCase();
  const buf = fs.readFileSync(absPath);
  const mime =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

/**
 * Logo için: şeffaflığı korur, beyaz kutu oluşturmaz.
 * PNG alfa kanalı olduğu gibi kalır; SVG/WebP şeffaf PNG'ye dönüştürülür.
 */
export async function resolvePdfLogoSrc(
  publicPath: string | null | undefined
): Promise<string | null> {
  if (!publicPath?.trim()) return null;

  const abs = publicPathToAbsolute(publicPath);
  if (!absolutePathExists(abs)) return null;

  const ext = path.extname(abs).toLowerCase();

  try {
    if (ext === ".png") {
      return await toPngDataUriPreserveAlpha(abs);
    }
    if (ext === ".svg" || ext === ".webp") {
      return await toPngDataUriPreserveAlpha(abs);
    }
    if (ext === ".jpg" || ext === ".jpeg") {
      return toDataUri(abs);
    }
    return await toPngDataUriPreserveAlpha(abs);
  } catch {
    return null;
  }
}

/** Genel görseller (hizmet fotoğrafları vb.) */
export async function resolvePdfImageSrc(
  publicPath: string | null | undefined
): Promise<string | null> {
  if (!publicPath?.trim()) return null;

  const abs = publicPathToAbsolute(publicPath);
  if (!absolutePathExists(abs)) return null;

  const ext = path.extname(abs).toLowerCase();

  try {
    if (ext === ".svg" || ext === ".webp") {
      return await toPngDataUri(abs);
    }
    if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
      return toDataUri(abs);
    }
    return await toPngDataUri(abs);
  } catch {
    return null;
  }
}
