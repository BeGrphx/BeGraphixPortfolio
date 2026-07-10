import { FadeIn } from "@/components/FadeIn";
import { MediaBlock } from "@/components/MediaBlock";
import {
  ProjectChapterNav,
  type ProjectChapter,
} from "@/components/ProjectChapterNav";
import { ProjectGallery } from "@/components/ProjectGallery";
import { VideoGallery } from "@/components/VideoGallery";
import {
  layoutBlockHasContent,
  resolveProjectLayout,
  type ProjectLayoutBlockType,
} from "@/lib/project-layout";
import type { SanityProject } from "@/lib/sanity/queries";

interface LocalizedProject extends SanityProject {
  title: string;
  description?: string;
  credits?: string;
}

interface ProjectPageBlocksProps {
  project: LocalizedProject;
  downloadPdfLabel: string;
  chapterNavLabel: string;
  chapterLabels: Record<ProjectLayoutBlockType, string>;
}

export function ProjectPageBlocks({
  project,
  downloadPdfLabel,
  chapterNavLabel,
  chapterLabels,
}: ProjectPageBlocksProps) {
  const layout = resolveProjectLayout(project.pageBlocks).filter((blockType) =>
    layoutBlockHasContent(blockType, project),
  );
  const chapters: ProjectChapter[] = layout.map((blockType, index) => ({
    id: `project-chapter-${index + 1}`,
    label: chapterLabels[blockType],
  }));

  return (
    <>
      <ProjectChapterNav chapters={chapters} ariaLabel={chapterNavLabel} />

      {layout.map((blockType, index) => (
        <div
          id={chapters[index].id}
          key={`${blockType}-${index}`}
          data-project-chapter={blockType}
          className="scroll-mt-28"
        >
          <ProjectLayoutBlock
            type={blockType}
            project={project}
            index={index}
            downloadPdfLabel={downloadPdfLabel}
          />
        </div>
      ))}
    </>
  );
}

function ProjectLayoutBlock({
  type,
  project,
  index,
  downloadPdfLabel,
}: {
  type: ProjectLayoutBlockType;
  project: LocalizedProject;
  index: number;
  downloadPdfLabel: string;
}) {
  if (!layoutBlockHasContent(type, project)) return null;

  const delay = 0.06 + index * 0.04;

  switch (type) {
    case "layoutVideoGallery":
      return project.videoGallery ? (
        <VideoGallery videos={project.videoGallery} />
      ) : null;

    case "layoutText":
      return (
        <FadeIn delay={delay} className="w-full">
          <section className="mx-auto flex w-full min-h-[min(40vh,28rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20 md:min-h-[min(44vh,32rem)] md:py-24">
            {project.description && (
              <p className="mx-auto w-full max-w-2xl text-center text-[15px] leading-relaxed text-foreground sm:text-base md:text-lg">
                {project.description}
              </p>
            )}
            {project.credits && (
              <p
                className={`font-mono mx-auto w-full max-w-xl text-center text-[11px] leading-relaxed text-muted ${
                  project.description ? "mt-8" : ""
                }`}
              >
                {project.credits}
              </p>
            )}
          </section>
        </FadeIn>
      );

    case "layoutGallery":
      return project.gallery && project.gallery.length > 0 ? (
        <ProjectGallery items={project.gallery} />
      ) : null;

    case "layoutPdf":
      return project.pdfFile?.asset?.url ? (
        <FadeIn delay={delay}>
          <div className="mb-16 flex justify-center">
            <a
              href={project.pdfFile.asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center bg-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80"
            >
              {downloadPdfLabel} ↓
            </a>
          </div>
        </FadeIn>
      ) : null;

    case "layoutMedia":
      return project.media && project.media.length > 0 ? (
        <div className="mx-auto max-w-5xl space-y-12 px-4">
          {project.media.map((item, mediaIndex) => (
            <MediaBlock key={item._key} item={item} index={mediaIndex} />
          ))}
        </div>
      ) : null;

    default:
      return null;
  }
}
