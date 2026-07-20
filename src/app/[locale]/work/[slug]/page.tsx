import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import type { Locale } from "@/types";
import { isLocale, getMessages, localizedAlternates } from "@/lib/i18n";
import { getAdjacentProjects, getProjectBySlug } from "@/lib/content/queries";
import { ProjectMeta } from "@/components/portfolio/ProjectMeta";
import { PrevNextNav } from "@/components/portfolio/PrevNextNav";
import { PhotoGallery } from "@/components/media/PhotoGallery";
import { HeroVideoPlayer } from "@/components/media/HeroVideoPlayer";

async function loadProject(rawLocale: string, slug: string) {
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const project = await getProjectBySlug(slug, locale);
  if (!project) notFound();
  return { locale, project };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const project = await getProjectBySlug(slug, rawLocale);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { languages: localizedAlternates(`/work/${slug}`) },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const { locale, project } = await loadProject(rawLocale, slug);

  const t = getMessages(locale);
  const adjacent = await getAdjacentProjects(project.order, locale);

  const lightboxLabels = {
    close: t.lightbox.close,
    next: t.lightbox.next,
    previous: t.lightbox.previous,
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {project.type === "video" && project.youtubeUrl && (
        <HeroVideoPlayer
          youtubeUrl={project.youtubeUrl}
          coverImage={project.coverImage}
          previewClipUrl={project.previewClipUrl}
          playLabel={t.project.playVideo}
        />
      )}

      {project.type === "video" && !project.youtubeUrl && (
        <div className="bg-bg-secondary relative aspect-video w-full overflow-hidden">
          <Image
            src={project.coverImage.url}
            alt={project.coverImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-10">
        <ProjectMeta
          project={project}
          labels={{
            year: t.project.year,
            location: t.project.location,
            role: t.project.role,
            producerDirector: t.project.producerDirector,
            recognition: t.project.recognition,
          }}
        />
      </div>

      {project.type === "video" && project.gallery && project.gallery.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold">{t.project.behindTheScenes}</h2>
          <div className="mt-6">
            <PhotoGallery images={project.gallery} lightboxLabels={lightboxLabels} />
          </div>
        </div>
      )}

      {project.type === "photo" && project.gallery && project.gallery.length > 0 && (
        <div className="mt-4">
          <h2 className="sr-only">{t.project.gallery}</h2>
          <PhotoGallery images={project.gallery} lightboxLabels={lightboxLabels} />
        </div>
      )}

      <PrevNextNav
        adjacent={adjacent}
        locale={locale}
        labels={{ previous: t.project.previousProject, next: t.project.nextProject }}
      />
    </div>
  );
}
