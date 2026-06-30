import fs from "fs";
import path from "path";

export function companySlugFromDbPath(dbPath: string): string {
  const raw = dbPath.startsWith("file:") ? dbPath.slice(5) : dbPath;
  return path.basename(raw, ".db");
}

export function getCompanyBrandingDir(companySlug: string): string {
  return path.join(
    process.cwd(),
    "public",
    "uploads",
    "tenants",
    companySlug,
    "branding"
  );
}

export function getServiceUploadDir(companySlug: string, serviceId: string): string {
  return path.join(
    process.cwd(),
    "public",
    "uploads",
    "tenants",
    companySlug,
    "services",
    serviceId
  );
}

export function publicPathToAbsolute(publicPath: string): string {
  const relative = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  return path.join(process.cwd(), "public", relative);
}

export function absolutePathExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export function deleteServiceUploads(companySlug: string, serviceId: string): void {
  const dir = getServiceUploadDir(companySlug, serviceId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
