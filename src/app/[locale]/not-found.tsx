"use client";

import { useParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { DEFAULT_LOCALE, type Locale } from "@/types";
import { isLocale, localePath } from "@/lib/i18n";

const COPY: Record<Locale, { title: string; body: string; cta: string }> = {
  en: {
    title: "Page not found",
    body: "This project doesn't exist, or it isn't published yet.",
    cta: "Back to Work",
  },
  uk: {
    title: "Сторінку не знайдено",
    body: "Цього проєкту не існує, або він ще не опублікований.",
    cta: "До розділу Роботи",
  },
};

/**
 * Catches unknown/unpublished project slugs (spec Edge Cases) — reached via
 * `notFound()` from the Project detail page. `not-found.tsx` cannot receive
 * `params` as a prop, so the locale is read client-side via `useParams`.
 */
export default function LocaleNotFound() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale ?? "") ? (params.locale as Locale) : DEFAULT_LOCALE;
  const copy = COPY[locale];

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-32 text-center">
      <h1 className="text-3xl font-semibold">{copy.title}</h1>
      <p className="text-text-secondary max-w-md">{copy.body}</p>
      <ButtonLink href={localePath(locale, "/work")}>{copy.cta}</ButtonLink>
    </div>
  );
}
