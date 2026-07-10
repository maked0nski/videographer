"use client";

import { useMemo, useState } from "react";
import type { Locale, ProjectListItem, ProjectType } from "@/types";
import { ProjectCard } from "./ProjectCard";

type FilterValue = "all" | ProjectType;

export function WorkFilter({
  projects,
  locale,
  labels,
}: {
  projects: ProjectListItem[];
  locale: Locale;
  labels: { all: string; films: string; photography: string };
}) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((project) => project.type === filter)),
    [projects, filter],
  );

  const tabs: { value: FilterValue; label: string }[] = [
    { value: "all", label: labels.all },
    { value: "video", label: labels.films },
    { value: "photo", label: labels.photography },
  ];

  return (
    <div>
      <div role="tablist" className="border-border flex gap-8 border-b pb-4">
        {tabs.map((tab) => {
          const isActive = filter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(tab.value)}
              className={
                isActive
                  ? "text-accent text-sm font-medium tracking-wide uppercase"
                  : "text-text-secondary hover:text-text text-sm font-medium tracking-wide uppercase transition-colors"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} locale={locale} />
        ))}
      </div>
    </div>
  );
}
