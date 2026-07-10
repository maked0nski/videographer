import Image from "next/image";
import Link from "next/link";
import type { AdjacentProjects, Locale } from "@/types";
import { localePath } from "@/lib/i18n";

/**
 * Wraps around for 2+ projects; renders nothing for either direction that's
 * `null` (a single-project portfolio has nowhere to link) — data-model.md.
 */
export function PrevNextNav({
  adjacent,
  locale,
  labels,
}: {
  adjacent: AdjacentProjects;
  locale: Locale;
  labels: { previous: string; next: string };
}) {
  if (!adjacent.previous && !adjacent.next) return null;

  return (
    <nav
      aria-label="Project navigation"
      className="border-border mt-16 grid grid-cols-1 gap-4 border-t pt-8 sm:grid-cols-2"
    >
      {adjacent.previous && (
        <Link
          href={localePath(locale, `/work/${adjacent.previous.slug}`)}
          className="group border-border flex items-center gap-4 overflow-hidden rounded-sm border p-4"
        >
          <div className="bg-bg-secondary relative h-16 w-24 flex-shrink-0 overflow-hidden">
            <Image
              src={adjacent.previous.coverImage.url}
              alt={adjacent.previous.coverImage.alt}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-text-secondary text-xs tracking-wide uppercase">{labels.previous}</p>
            <p className="group-hover:text-accent mt-1 text-sm font-medium">
              {adjacent.previous.title}
            </p>
          </div>
        </Link>
      )}

      {adjacent.next && (
        <Link
          href={localePath(locale, `/work/${adjacent.next.slug}`)}
          className="group border-border flex items-center justify-end gap-4 overflow-hidden rounded-sm border p-4 text-right sm:col-start-2"
        >
          <div>
            <p className="text-text-secondary text-xs tracking-wide uppercase">{labels.next}</p>
            <p className="group-hover:text-accent mt-1 text-sm font-medium">
              {adjacent.next.title}
            </p>
          </div>
          <div className="bg-bg-secondary relative h-16 w-24 flex-shrink-0 overflow-hidden">
            <Image
              src={adjacent.next.coverImage.url}
              alt={adjacent.next.coverImage.alt}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        </Link>
      )}
    </nav>
  );
}
