import { renderToBuffer } from "@react-pdf/renderer";
import { registerPdfFonts } from "./fonts";
import { QuotePdfDocument } from "./QuotePdfDocument";
import type { QuotePdfData } from "./quote-data";

export async function generateQuotePdf(data: QuotePdfData): Promise<Buffer> {
  registerPdfFonts();
  const buffer = await renderToBuffer(
    <QuotePdfDocument data={data} servicePages={data.servicePages} />
  );
  return Buffer.from(buffer);
}
