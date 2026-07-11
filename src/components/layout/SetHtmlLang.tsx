"use client";

import { useEffect } from "react";
import type { Locale } from "@/types";

/**
 * The root `<html>` tag lives in `src/app/layout.tsx` with a static `lang`
 * (it also covers `/studio`, which has no locale), so locale pages correct
 * it client-side on mount.
 */
export function SetHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
