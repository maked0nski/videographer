import type { Locale, ProjectListItem } from "@/types";
import { localePath } from "@/lib/i18n";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Renders only when at least one photo-type project is published, and is
 * omitted entirely otherwise (FR-006, SC-010) — no manual toggle needed.
 */
export function PhotographyPreview({
  projects,
  locale,
  heading,
  cta,
}: {
  projects: ProjectListItem[];
  locale: Locale;
  heading: string;
  cta: string;
}) {
  const photoProjects = projects.filter((project) => project.type === "photo");
  if (photoProjects.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold">{heading}</h2>
        <ButtonLink href={localePath(locale, "/work")} variant="ghost">
          {cta}
        </ButtonLink>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {photoProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} locale={locale} />
        ))}
      </div>
    </section>
  );
}
