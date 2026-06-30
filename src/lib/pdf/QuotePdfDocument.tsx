import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { ServicePdfPage } from "./ServicePdfPage";
import type { ServicePdfPageData } from "./ServicePdfPage";
import type { QuotePdfData } from "./quote-data";
import {
  formatPdfCurrency,
  formatPdfDate,
  formatPdfDateShort,
  formatPdfQuantity,
} from "./format";
import { getStatusLabel } from "./labels";
import {
  BASE_CURRENCY,
  convertToTry,
  formatExchangeRate,
  isForeignCurrency,
} from "@/lib/currency";
import { PDF_COLORS } from "./pdf-theme";
import { getPdfFontFamily } from "./fonts";
import type { BrandPdfPalette } from "./logo-colors";
import { PdfCoverBrand, PdfPageBrandHeader } from "./PdfCompanyBrand";

function createStyles(p: BrandPdfPalette) {
  const font = getPdfFontFamily();
  return StyleSheet.create({
    coverPage: {
      fontFamily: font,
      backgroundColor: PDF_COLORS.slate900,
      padding: 0,
      justifyContent: "space-between",
    },
    coverTopBar: {
      height: 8,
      backgroundColor: p.primary,
    },
    coverBody: {
      flex: 1,
      paddingHorizontal: 48,
      paddingTop: 40,
      paddingBottom: 48,
      justifyContent: "center",
    },
    coverCompany: {
      fontFamily: font,
      fontSize: 14,
      color: p.primary,
      fontWeight: 700,
      letterSpacing: 1,
      marginBottom: 48,
      textTransform: "uppercase",
    },
    coverTitle: {
      fontFamily: font,
      fontSize: 48,
      fontWeight: 700,
      color: PDF_COLORS.white,
      marginBottom: 16,
    },
    coverSubtitle: {
      fontFamily: font,
      fontSize: 16,
      color: PDF_COLORS.slate400,
      marginBottom: 40,
    },
    coverCustomerBox: {
      borderLeftWidth: 4,
      borderLeftColor: p.primary,
      paddingLeft: 16,
      marginBottom: 24,
    },
    coverCustomerLabel: {
      fontFamily: font,
      fontSize: 10,
      color: PDF_COLORS.slate400,
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    coverCustomerName: {
      fontFamily: font,
      fontSize: 22,
      fontWeight: 700,
      color: PDF_COLORS.white,
    },
    coverFooter: {
      paddingHorizontal: 48,
      paddingBottom: 40,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    coverMeta: {
      fontFamily: font,
      fontSize: 10,
      color: PDF_COLORS.slate400,
    },
    coverMetaValue: {
      fontFamily: font,
      fontSize: 11,
      color: PDF_COLORS.white,
      fontWeight: 700,
      marginTop: 2,
    },
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
      marginBottom: 28,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: p.primary,
    },
    companyName: {
      fontFamily: font,
      fontSize: 16,
      fontWeight: 700,
      color: PDF_COLORS.slate900,
      marginBottom: 6,
    },
    companyDetail: {
      fontFamily: font,
      fontSize: 9,
      color: PDF_COLORS.slate500,
      marginBottom: 2,
    },
    quoteMetaBox: {
      alignItems: "flex-end",
    },
    quoteMetaTitle: {
      fontFamily: font,
      fontSize: 18,
      fontWeight: 700,
      color: p.primary,
      marginBottom: 8,
    },
    quoteMetaRow: {
      fontFamily: font,
      fontSize: 9,
      color: PDF_COLORS.slate500,
      marginBottom: 2,
    },
    quoteMetaValue: {
      fontFamily: font,
      fontWeight: 700,
      color: PDF_COLORS.slate700,
    },
    sectionTitle: {
      fontFamily: font,
      fontSize: 10,
      fontWeight: 700,
      color: PDF_COLORS.slate500,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    customerBox: {
      backgroundColor: PDF_COLORS.slate50,
      padding: 14,
      borderRadius: 4,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: PDF_COLORS.slate200,
    },
    customerName: {
      fontFamily: font,
      fontSize: 12,
      fontWeight: 700,
      color: PDF_COLORS.slate900,
      marginBottom: 6,
    },
    customerDetail: {
      fontFamily: font,
      fontSize: 9,
      color: PDF_COLORS.slate500,
      marginBottom: 2,
    },
    table: {
      marginBottom: 20,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: PDF_COLORS.slate900,
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
    tableHeaderCell: {
      fontFamily: font,
      color: PDF_COLORS.white,
      fontSize: 8,
      fontWeight: 700,
      textTransform: "uppercase",
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: PDF_COLORS.slate200,
    },
    tableRowAlt: {
      backgroundColor: PDF_COLORS.slate50,
    },
    tableCell: {
      fontFamily: font,
      fontSize: 9,
      color: PDF_COLORS.slate700,
    },
    colNo: { width: "6%" },
    colDesc: { width: "32%" },
    colUnit: { width: "10%", textAlign: "right" },
    colQty: { width: "12%", textAlign: "right" },
    colPrice: { width: "20%", textAlign: "right" },
    colTotal: { width: "20%", textAlign: "right" },
    totalsBox: {
      alignSelf: "flex-end",
      width: 220,
      marginTop: 8,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    totalLabel: {
      fontFamily: font,
      fontSize: 9,
      color: PDF_COLORS.slate500,
    },
    totalValue: {
      fontFamily: font,
      fontSize: 9,
      fontWeight: 700,
      color: PDF_COLORS.slate700,
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 8,
      marginTop: 4,
      borderTopWidth: 2,
      borderTopColor: p.primary,
    },
    grandTotalLabel: {
      fontFamily: font,
      fontSize: 11,
      fontWeight: 700,
      color: PDF_COLORS.slate900,
    },
    grandTotalValue: {
      fontFamily: font,
      fontSize: 13,
      fontWeight: 700,
      color: p.primary,
    },
    fxNote: {
      fontFamily: font,
      fontSize: 8,
      color: PDF_COLORS.slate500,
      marginTop: 6,
      textAlign: "right",
    },
    notesBox: {
      marginTop: 24,
      padding: 14,
      backgroundColor: PDF_COLORS.slate50,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: PDF_COLORS.slate200,
    },
    notesTitle: {
      fontFamily: font,
      fontSize: 10,
      fontWeight: 700,
      color: PDF_COLORS.slate700,
      marginBottom: 6,
    },
    notesText: {
      fontFamily: font,
      fontSize: 9,
      color: PDF_COLORS.slate500,
      lineHeight: 1.5,
    },
    pageFooter: {
      position: "absolute",
      bottom: 30,
      left: 40,
      right: 40,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: PDF_COLORS.slate200,
      paddingTop: 10,
    },
    footerText: {
      fontFamily: font,
      fontSize: 8,
      color: PDF_COLORS.slate500,
    },
  });
}

function DetailLines({
  lines,
  style,
}: {
  lines: (string | null | undefined)[];
  style: object;
}) {
  const filtered = lines.filter(Boolean) as string[];
  if (filtered.length === 0) return <View />;
  return (
    <View>
      {filtered.map((line, i) => (
        <Text key={i} style={style}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export function QuotePdfDocument({
  data,
  servicePages = [],
}: {
  data: QuotePdfData;
  servicePages?: ServicePdfPageData[];
}) {
  const { company, customer, quote, preparedBy, palette } = data;
  const styles = createStyles(palette);
  const cur = quote.currency || BASE_CURRENCY;
  const fmt = (n: number) => formatPdfCurrency(n, cur);
  const foreign = isForeignCurrency(cur);

  const validityText = quote.validUntil
    ? `Bu teklif ${formatPdfDate(quote.validUntil)} tarihine kadar geçerlidir.`
    : "Bu teklif için geçerlilik süresi firma ile mutabık kalınacaktır.";

  const defaultNotes = [
    "Belirtilen kapsam ve miktarlar için geçerlidir.",
    "Birim fiyatlara KDV dahil değildir.",
    "Ödeme koşulları yazılı mutabakatla belirlenir.",
    ...(quote.validUntil ? [`${formatPdfDate(quote.validUntil)} tarihine kadar geçerlidir.`] : []),
  ];

  return (
    <Document
      title={`Teklif ${quote.quoteNumber}`}
      author={company.name}
      subject={`${customer.name} - ${quote.quoteNumber}`}
      language="tr"
    >
      {/* Kapak */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverTopBar} />
        <PdfCoverBrand
          name={company.name}
          logoSrc={company.logoLightSrc ?? company.logoSrc}
          quoteNumber={quote.quoteNumber}
        />
        <View style={styles.coverBody}>
          {!company.logoSrc ? (
            <Text style={[styles.coverCompany, { marginBottom: 32 }]}>{company.name}</Text>
          ) : (
            <View />
          )}
          <Text style={styles.coverTitle}>TEKLİF</Text>
          <Text style={styles.coverSubtitle}>Fiyat teklifi ve hizmet kapsamı</Text>
          <View style={styles.coverCustomerBox}>
            <Text style={styles.coverCustomerLabel}>Müşteri</Text>
            <Text style={styles.coverCustomerName}>{customer.name}</Text>
          </View>
        </View>
        <View style={styles.coverFooter}>
          <View>
            <Text style={styles.coverMeta}>Teklif No</Text>
            <Text style={styles.coverMetaValue}>{quote.quoteNumber}</Text>
          </View>
          <View>
            <Text style={styles.coverMeta}>Tarih</Text>
            <Text style={styles.coverMetaValue}>{formatPdfDate(quote.createdAt)}</Text>
          </View>
          <View>
            <Text style={styles.coverMeta}>Geçerlilik</Text>
            <Text style={styles.coverMetaValue}>
              {quote.validUntil ? formatPdfDate(quote.validUntil) : "Belirtilmemiş"}
            </Text>
          </View>
        </View>
      </Page>

      {servicePages.map((sp, i) => (
        <ServicePdfPage key={i} data={sp} />
      ))}

      {/* Teklif içeriği */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <PdfPageBrandHeader name={company.name} logoSrc={company.logoSrc}>
            <DetailLines
              style={styles.companyDetail}
              lines={[
                company.taxNumber ? `VKN: ${company.taxNumber}` : null,
                company.address,
                company.city,
                company.phone ? `Tel: ${company.phone}` : null,
                company.email,
              ]}
            />
          </PdfPageBrandHeader>
          <View style={styles.quoteMetaBox}>
            <Text style={styles.quoteMetaTitle}>{quote.quoteNumber}</Text>
            <Text style={styles.quoteMetaRow}>
              Tarih:{" "}
              <Text style={styles.quoteMetaValue}>{formatPdfDateShort(quote.createdAt)}</Text>
            </Text>
            {quote.validUntil ? (
              <Text style={styles.quoteMetaRow}>
                Geçerlilik:{" "}
                <Text style={styles.quoteMetaValue}>
                  {formatPdfDateShort(quote.validUntil)}
                </Text>
              </Text>
            ) : (
              <Text style={styles.quoteMetaRow} />
            )}
            <Text style={styles.quoteMetaRow}>
              Durum:{" "}
              <Text style={styles.quoteMetaValue}>{getStatusLabel(quote.status)}</Text>
            </Text>
            <Text style={styles.quoteMetaRow}>
              Hazırlayan:{" "}
              <Text style={styles.quoteMetaValue}>{preparedBy}</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
        <View style={styles.customerBox}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <DetailLines
            style={styles.customerDetail}
            lines={[
              customer.taxNumber ? `VKN: ${customer.taxNumber}` : null,
              customer.taxOffice ? `Vergi Dairesi: ${customer.taxOffice}` : null,
              customer.address,
              customer.city,
              customer.phone ? `Tel: ${customer.phone}` : null,
              customer.email,
            ]}
          />
        </View>

        <Text style={styles.sectionTitle}>Teklif Kalemleri</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>#</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Açıklama</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Birim</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Miktar</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Birim Fiyat</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Toplam</Text>
          </View>
          {quote.items.map((item, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
              wrap={false}
            >
              <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>
                {formatPdfQuantity(item.quantity)}
              </Text>
              <Text style={[styles.tableCell, styles.colPrice]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Ara Toplam</Text>
            <Text style={styles.totalValue}>{fmt(quote.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>KDV (%{quote.taxRate})</Text>
            <Text style={styles.totalValue}>{fmt(quote.taxAmount)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Genel Toplam</Text>
            <Text style={styles.grandTotalValue}>{fmt(quote.total)}</Text>
          </View>
          {foreign ? (
            <Text style={styles.fxNote}>
              Kur: 1 {cur} = {formatExchangeRate(cur, quote.exchangeRate)} TL{"\n"}
              TRY: {formatPdfCurrency(convertToTry(quote.total, cur, quote.exchangeRate), BASE_CURRENCY)}
            </Text>
          ) : (
            <Text style={styles.fxNote} />
          )}
        </View>

        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>
            {quote.notes ? "Notlar ve Koşullar" : "Genel Koşullar"}
          </Text>
          {quote.notes ? (
            <Text style={styles.notesText}>{quote.notes}</Text>
          ) : (
            <View>
              {defaultNotes.map((note, i) => (
                <Text key={i} style={styles.notesText}>
                  • {note}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>
            Hazırlayan: {preparedBy} · {company.name}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${quote.quoteNumber} · ${pageNumber}/${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
