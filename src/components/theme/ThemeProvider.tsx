"use client";

import { buildThemeStyle } from "@/lib/theme";

export function ThemeProvider({
  themeColor,
  children,
}: {
  themeColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="contents" style={buildThemeStyle(themeColor)}>
      {children}
    </div>
  );
}
