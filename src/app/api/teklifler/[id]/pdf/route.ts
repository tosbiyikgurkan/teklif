import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getQuotePdfData } from "@/lib/pdf/quote-data";
import { generateQuotePdf } from "@/lib/pdf/generate-quote-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.companyDbPath) {
      return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
    }

    const { id } = await params;
    const data = await getQuotePdfData(id, session);
    const pdfBuffer = await generateQuotePdf(data);

    const filename = `Teklif-${data.quote.quoteNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
