import type { Locale } from "@/types";
import { localePath } from "@/lib/i18n";
import { ButtonLink } from "@/components/ui/Button";

/** Links to the About & Contact page's contact section. */
export function ContactCta({
  locale,
  heading,
  cta,
}: {
  locale: Locale;
  heading: string;
  cta: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 text-center">
      <h2 className="text-3xl font-semibold sm:text-4xl">{heading}</h2>
      <ButtonLink href={localePath(locale, "/about#contact")} className="mt-8 inline-flex">
        {cta}
      </ButtonLink>
    </section>
  );
}
