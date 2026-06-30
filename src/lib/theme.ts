export const DEFAULT_THEME_COLOR = "#059669";

export const THEME_PRESETS = [
  { name: "Zümrüt", color: "#059669" },
  { name: "Okyanus", color: "#0284c7" },
  { name: "İndigo", color: "#4f46e5" },
  { name: "Mor", color: "#7c3aed" },
  { name: "Pembe", color: "#db2777" },
  { name: "Kırmızı", color: "#dc2626" },
  { name: "Turuncu", color: "#ea580c" },
  { name: "Kehribar", color: "#d97706" },
  { name: "Teal", color: "#0d9488" },
  { name: "Çelik", color: "#475569" },
] as const;

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

export function normalizeThemeColor(color: string | null | undefined): string {
  if (!color) return DEFAULT_THEME_COLOR;
  const withHash = color.startsWith("#") ? color : `#${color}`;
  return parseHex(withHash) ? withHash.toLowerCase() : DEFAULT_THEME_COLOR;
}

export function buildThemeStyle(color: string): React.CSSProperties {
  const primary = normalizeThemeColor(color);
  return {
    "--theme-primary": primary,
    "--theme-primary-hover": darken(primary, 0.14),
    "--theme-primary-dark": darken(primary, 0.28),
    "--theme-primary-light": mixWithWhite(primary, 0.9),
    "--theme-primary-muted": mixWithWhite(primary, 0.82),
    "--theme-primary-ring": `${primary}33`,
  } as React.CSSProperties;
}
