import { normalizeThemeColor } from "@/lib/theme";

export const PDF_COLORS = {
  slate900: "#0f172a",
  slate700: "#334155",
  slate500: "#64748b",
  slate600: "#475569",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",
  white: "#ffffff",
} as const;

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixWithWhite(hex: string, whiteRatio: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const ratio = Math.max(0, Math.min(1, whiteRatio));
  return toHex(
    rgb.r + (255 - rgb.r) * ratio,
    rgb.g + (255 - rgb.g) * ratio,
    rgb.b + (255 - rgb.b) * ratio
  );
}

function darken(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const factor = 1 - Math.max(0, Math.min(1, amount));
  return toHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
}

export type PdfPalette = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryMuted: string;
};

export function buildPdfPalette(themeColor?: string | null): PdfPalette {
  const primary = normalizeThemeColor(themeColor);
  return {
    primary,
    primaryDark: darken(primary, 0.22),
    primaryLight: mixWithWhite(primary, 0.88),
    primaryMuted: mixWithWhite(primary, 0.94),
  };
}
