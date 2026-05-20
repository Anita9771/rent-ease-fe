"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { PropsWithChildren } from "react";

export function ThemeProvider({ children, ...props }: PropsWithChildren<Record<string, unknown>>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

