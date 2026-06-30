import type { ReactNode } from "react";
import { Image, Text, View, StyleSheet } from "@react-pdf/renderer";
import { getPdfFontFamily } from "./fonts";
import { PDF_COLORS } from "./pdf-theme";

const SIZES = {
  hero: { width: 220, height: 80 },
  cover: { width: 200, height: 72 },
  header: { width: 150, height: 56 },
  compact: { width: 120, height: 44 },
  "on-brand": { width: 160, height: 58 },
} as const;

const font = getPdfFontFamily();

const styles = StyleSheet.create({
  nameHero: {
    fontFamily: font,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  nameCover: {
    fontFamily: font,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  nameHeader: {
    fontFamily: font,
    fontSize: 14,
    fontWeight: 700,
  },
  nameOnBrand: {
    fontFamily: font,
    fontSize: 12,
    fontWeight: 700,
    color: "#ffffff",
  },
  nameBelow: {
    fontFamily: font,
    fontSize: 9,
    fontWeight: 700,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  logoWrap: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
});

type BrandVariant = keyof typeof SIZES;

type BrandProps = {
  name: string;
  logoSrc?: string | null;
  variant: BrandVariant;
  nameColor?: string;
  showNameBelow?: boolean;
};

export function PdfCompanyBrand({
  name,
  logoSrc,
  variant,
  nameColor = "#0f172a",
  showNameBelow = false,
}: BrandProps) {
  if (logoSrc) {
    return (
      <View style={styles.logoWrap}>
        <Image
          src={logoSrc}
          style={{ ...SIZES[variant], objectFit: "contain" }}
        />
        {showNameBelow ? (
          <Text style={[styles.nameBelow, { color: nameColor }]}>{name}</Text>
        ) : (
          <Text />
        )}
      </View>
    );
  }

  const nameStyles = {
    hero: { ...styles.nameHero, color: nameColor },
    cover: { ...styles.nameCover, color: nameColor },
    header: { ...styles.nameHeader, color: nameColor },
    "on-brand": styles.nameOnBrand,
    compact: { ...styles.nameHeader, color: nameColor, fontSize: 11 },
  };

  return <Text style={nameStyles[variant]}>{name}</Text>;
}

/** Kapak sayfası üst marka alanı */
export function PdfCoverBrand({
  name,
  logoSrc,
  quoteNumber,
}: {
  name: string;
  logoSrc: string | null;
  quoteNumber: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 48,
        paddingTop: 36,
        paddingBottom: 28,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.12)",
      }}
    >
      <PdfCompanyBrand
        name={name}
        logoSrc={logoSrc}
        variant="cover"
        nameColor={PDF_COLORS.slate400}
        showNameBelow={!!logoSrc}
      />
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontFamily: font,
            fontSize: 8,
            color: PDF_COLORS.slate400,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 4,
          }}
        >
          Teklif No
        </Text>
        <Text
          style={{
            fontFamily: font,
            fontSize: 13,
            fontWeight: 700,
            color: PDF_COLORS.white,
          }}
        >
          {quoteNumber}
        </Text>
      </View>
    </View>
  );
}

/** İçerik sayfası üst başlık — logo + firma bilgisi */
export function PdfPageBrandHeader({
  name,
  logoSrc,
  nameColor = PDF_COLORS.slate900,
  children,
}: {
  name: string;
  logoSrc: string | null;
  nameColor?: string;
  children?: ReactNode;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", flex: 1, marginRight: 16 }}>
      <View style={{ marginRight: logoSrc ? 18 : 0, minWidth: logoSrc ? 150 : 0 }}>
        <PdfCompanyBrand
          name={name}
          logoSrc={logoSrc}
          variant="header"
          nameColor={nameColor}
        />
      </View>
      <View style={{ flex: 1, paddingTop: logoSrc ? 4 : 0 }}>
        {!logoSrc ? (
          <Text
            style={{
              fontFamily: font,
              fontSize: 16,
              fontWeight: 700,
              color: nameColor,
              marginBottom: 6,
            }}
          >
            {name}
          </Text>
        ) : (
          <Text />
        )}
        {children}
      </View>
    </View>
  );
}
