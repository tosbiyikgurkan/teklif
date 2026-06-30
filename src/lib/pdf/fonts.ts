import path from "path";
import { Font } from "@react-pdf/renderer";
import fs from "fs";

let registered = false;

export const PDF_FONT_FAMILY = "Roboto";

function fontDataUri(filename: string): string {
  const abs = path.join(process.cwd(), "public", "fonts", filename);
  if (!fs.existsSync(abs)) {
    throw new Error(
      `PDF font dosyası bulunamadı: ${abs}. public/fonts klasörünü kontrol edin.`
    );
  }
  const base64 = fs.readFileSync(abs).toString("base64");
  return `data:font/truetype;base64,${base64}`;
}

export function getPdfFontFamily(): string {
  return PDF_FONT_FAMILY;
}

/** Tüm PDF Text stillerine Türkçe destekli font ekler */
export function withPdfFont<T extends Record<string, unknown>>(style: T) {
  return { fontFamily: PDF_FONT_FAMILY, ...style };
}

export function registerPdfFonts() {
  if (registered) return;

  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      {
        src: fontDataUri("Roboto-Regular.ttf"),
        fontWeight: 400,
        fontStyle: "normal",
      },
      {
        src: fontDataUri("Roboto-Bold.ttf"),
        fontWeight: 700,
        fontStyle: "normal",
      },
    ],
  });

  // Türkçe kelimelerin harf harf bölünmesini engelle
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}
