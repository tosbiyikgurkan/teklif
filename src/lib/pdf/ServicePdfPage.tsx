import { Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { ServicePageContent } from "@/lib/service-page";
import { PdfPageBrandHeader } from "./PdfCompanyBrand";
import { PDF_COLORS } from "./pdf-theme";
import { getPdfFontFamily } from "./fonts";
import type { BrandPdfPalette } from "./logo-colors";

export type ResolvedServiceImage = {
  id: string;
  caption?: string;
  src: string | null;
};

export type ServicePdfPageData = {
  companyName: string;
  companyLogoSrc?: string | null;
  palette: BrandPdfPalette;
  serviceName: string;
  quoteNumber: string;
  page: Omit<ServicePageContent, "images"> & { images: ResolvedServiceImage[] };
};

function createStyles(p: BrandPdfPalette) {
  const font = getPdfFontFamily();
  return StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize: 10,
      color: PDF_COLORS.slate700,
      padding: 40,
      paddingBottom: 56,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: p.primary,
    },
    quoteNoBox: {
      alignItems: "flex-end",
      paddingTop: 4,
    },
    quoteNo: {
      fontFamily: font,
      fontSize: 12,
      fontWeight: 700,
      color: p.primary,
    },
    title: {
      fontFamily: font,
      fontSize: 18,
      fontWeight: 700,
      color: PDF_COLORS.slate900,
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: font,
      fontSize: 11,
      color: PDF_COLORS.slate500,
      marginBottom: 12,
      lineHeight: 1.4,
    },
    intro: {
      fontFamily: font,
      fontSize: 10,
      color: PDF_COLORS.slate700,
      lineHeight: 1.6,
      marginBottom: 18,
    },
    sectionTitle: {
      fontFamily: font,
      fontSize: 10,
      fontWeight: 700,
      color: PDF_COLORS.slate500,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
      marginTop: 8,
    },
    highlightBox: {
      backgroundColor: PDF_COLORS.slate50,
      padding: 14,
      borderRadius: 4,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: PDF_COLORS.slate200,
    },
    highlightItem: {
      fontFamily: font,
      fontSize: 9,
      color: PDF_COLORS.slate700,
      marginBottom: 4,
      lineHeight: 1.4,
    },
    imageRow: { flexDirection: "row", marginBottom: 12 },
    imageCard: { width: "48%", marginRight: 12 },
    imageCardLast: { width: "48%", marginRight: 0 },
    image: {
      width: "100%",
      height: 120,
      objectFit: "cover",
      borderWidth: 1,
      borderColor: PDF_COLORS.slate200,
    },
    caption: {
      fontFamily: font,
      fontSize: 7,
      color: PDF_COLORS.slate500,
      marginTop: 4,
      textAlign: "center",
    },
    blockTitle: {
      fontFamily: font,
      fontSize: 10,
      fontWeight: 700,
      color: p.primaryDark,
      marginBottom: 5,
    },
    blockBody: {
      fontFamily: font,
      fontSize: 9,
      lineHeight: 1.55,
      color: PDF_COLORS.slate700,
      marginBottom: 14,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: PDF_COLORS.slate200,
      paddingTop: 10,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerText: {
      fontFamily: font,
      fontSize: 8,
      color: PDF_COLORS.slate500,
    },
  });
}

export function ServicePdfPage({ data }: { data: ServicePdfPageData }) {
  const { companyName, companyLogoSrc, palette, serviceName, quoteNumber, page } = data;
  const styles = createStyles(palette);
  const title = page.title.trim() || serviceName;
  const images = page.images.filter((i) => i.src);
  const highlights = page.highlights.filter((h) => h.trim());
  const sections = page.sections.filter((s) => s.title.trim() || s.content.trim());

  const imageRows: (typeof images)[] = [];
  for (let i = 0; i < images.length; i += 2) {
    imageRows.push(images.slice(i, i + 2));
  }

  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <PdfPageBrandHeader
          name={companyName}
          logoSrc={companyLogoSrc ?? null}
        />
        <View style={styles.quoteNoBox}>
          <Text style={styles.quoteNo}>{quoteNumber}</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
        {page.subtitle ? <Text style={styles.subtitle}>{page.subtitle}</Text> : <Text style={styles.subtitle} />}
        {page.intro ? <Text style={styles.intro}>{page.intro}</Text> : <Text style={styles.intro} />}

      {highlights.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Öne Çıkanlar</Text>
          <View style={styles.highlightBox}>
            {highlights.map((h, i) => (
              <Text key={i} style={styles.highlightItem}>
                • {h}
              </Text>
            ))}
          </View>
        </View>
      )}

      {imageRows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.imageRow}>
          {row.map((img, colIdx) => (
            <View
              key={img.id}
              style={colIdx === 0 && row.length > 1 ? styles.imageCard : styles.imageCardLast}
            >
              <Image src={img.src!} style={styles.image} />
                {img.caption ? <Text style={styles.caption}>{img.caption}</Text> : <Text style={styles.caption} />}
            </View>
          ))}
        </View>
      ))}

      {sections.map((sec) => (
        <View key={sec.id} wrap={false}>
          {sec.title ? <Text style={styles.blockTitle}>{sec.title}</Text> : <Text style={styles.blockTitle} />}
          {sec.content ? <Text style={styles.blockBody}>{sec.content}</Text> : <Text style={styles.blockBody} />}
        </View>
      ))}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{companyName}</Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `${quoteNumber} · ${pageNumber}/${totalPages}`
          }
        />
      </View>
    </Page>
  );
}
