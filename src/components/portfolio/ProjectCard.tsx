import Image from "next/image";
import Link from "next/link";
import type { Locale, ProjectListItem } from "@/types";
import { localePath } from "@/lib/i18n";

export function ProjectCard({ project, locale }: { project: ProjectListItem; locale: Locale }) {
  return (
    <Link
      href={localePath(locale, `/work/${project.slug}`)}
      data-project-type={project.type}
      className="group border-border block overflow-hidden rounded-sm border"
    >
      <div className="bg-bg-secondary relative aspect-[16/10] overflow-hidden">
        <Image
          src={project.coverImage.url}
          alt={project.coverImage.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {project.type === "video" && (
          <span
            aria-hidden="true"
            className="border-border/60 bg-bg/70 absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur"
          >
            <svg viewBox="0 0 24 24" className="text-accent h-4 w-4" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 px-1 py-4">
        <h3 className="text-base font-medium">{project.title}</h3>
        <span className="text-text-secondary text-sm">{project.year}</span>
      </div>
    </Link>
  );
}
