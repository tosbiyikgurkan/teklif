import sharp from "sharp";
import { absolutePathExists, publicPathToAbsolute } from "@/lib/uploads";
import { normalizeThemeColor } from "@/lib/theme";
import { buildPdfPalette, type PdfPalette } from "./pdf-theme";

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb | null {
  const n = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(n)) return null;
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[c(r), c(g), c(b)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function mixRgb(a: Rgb, b: Rgb, ratio: number): Rgb {
  const t = Math.max(0, Math.min(1, ratio));
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function saturation({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max === 0) return 0;
  return (max - min) / max;
}

function lightness({ r, g, b }: Rgb): number {
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255;
}

function colorDist(a: Rgb, b: Rgb): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

async function sampleLogoColors(
  publicPath: string
): Promise<Rgb[]> {
  const abs = publicPathToAbsolute(publicPath);
  if (!absolutePathExists(abs)) return [];

  const { data, info } = await sharp(abs)
    .ensureAlpha()
    .resize(96, 96, { fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map<string, { rgb: Rgb; weight: number }>();
  const channels = info.channels;

  for (let i = 0; i < data.length; i += channels) {
    const alpha = channels === 4 ? data[i + 3] : 255;
    if (alpha < 100) continue;

    const rgb: Rgb = { r: data[i], g: data[i + 1], b: data[i + 2] };
    const sat = saturation(rgb);
    const lit = lightness(rgb);

    if (lit > 0.9 || lit < 0.1 || sat < 0.12) continue;

    const q: Rgb = {
      r: Math.round(rgb.r / 20) * 20,
      g: Math.round(rgb.g / 20) * 20,
      b: Math.round(rgb.b / 20) * 20,
    };
    const key = rgbToHex(q);
    const weight = sat * 2 + (1 - Math.abs(lit - 0.42)) + 0.5;
    const prev = buckets.get(key);
    buckets.set(key, { rgb: q, weight: (prev?.weight ?? 0) + weight });
  }

  const ranked = [...buckets.values()].sort((a, b) => b.weight - a.weight);
  const picked: Rgb[] = [];

  for (const entry of ranked) {
    if (picked.some((c) => colorDist(c, entry.rgb) < 55)) continue;
    picked.push(entry.rgb);
    if (picked.length >= 2) break;
  }

  return picked;
}

export type BrandPdfPalette = PdfPalette & {
  secondary: string;
  accent: string;
  coverBg: string;
  coverBand: string;
  coverLight: string;
  coverStripe: string;
  surface: string;
  tableHeader: string;
  onPrimary: string;
  fromLogo: boolean;
};

export async function buildBrandPdfPalette(
  logoPath: string | null | undefined,
  themeColor?: string | null
): Promise<BrandPdfPalette> {
  let logoColors: Rgb[] = [];
  if (logoPath) {
    try {
      logoColors = await sampleLogoColors(logoPath);
    } catch {
      logoColors = [];
    }
  }

  const fromLogo = logoColors.length > 0;
  const primaryHex = fromLogo
    ? rgbToHex(logoColors[0])
    : normalizeThemeColor(themeColor);

  const base = buildPdfPalette(primaryHex);
  const primaryRgb = parseHex(base.primary) ?? { r: 5, g: 150, b: 105 };

  const secondaryRgb = fromLogo && logoColors[1]
    ? logoColors[1]
    : mixRgb(primaryRgb, { r: 30, g: 64, b: 120 }, 0.35);

  const coverBg = "#ffffff";
  const coverBand = base.primary;
  const coverLight = base.primaryMuted;
  const coverStripe = base.primary;
  const surface = base.primaryMuted;
  const accent = rgbToHex(mixRgb(primaryRgb, secondaryRgb, 0.45));

  const primaryLit = lightness(primaryRgb);
  const onPrimary = primaryLit > 0.62 ? "#0f172a" : "#ffffff";

  return {
    ...base,
    secondary: rgbToHex(secondaryRgb),
    accent,
    coverBg,
    coverBand,
    coverLight,
    coverStripe,
    surface,
    tableHeader: base.primary,
    onPrimary,
    fromLogo,
  };
}
