import type { ResolvedProject } from "@/types";

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-text-secondary text-xs tracking-wide uppercase">{label}</dt>
      <dd className="text-text text-sm">{value}</dd>
    </div>
  );
}

/**
 * Optional fields (producerDirector, recognition, location) are simply
 * omitted when absent — never rendered empty (FR-010, spec Edge Cases).
 */
export function ProjectMeta({
  project,
  labels,
}: {
  project: ResolvedProject;
  labels: {
    year: string;
    location: string;
    role: string;
    producerDirector: string;
    recognition: string;
  };
}) {
  return (
    <div>
      <h1 className="text-3xl font-semibold sm:text-4xl">{project.title}</h1>
      <p className="text-text-secondary mt-4 max-w-2xl text-base">{project.description}</p>
      <dl className="border-border mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-3">
        <MetaRow label={labels.year} value={project.year} />
        <MetaRow label={labels.location} value={project.location} />
        <MetaRow label={labels.role} value={project.role} />
        <MetaRow label={labels.producerDirector} value={project.producerDirector} />
        <MetaRow label={labels.recognition} value={project.recognition} />
      </dl>
    </div>
  );
}
