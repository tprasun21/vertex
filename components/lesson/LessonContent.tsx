import {
  CircleCheck,
  Download,
  ExternalLink,
  FileText,
  FolderGit2,
  Lightbulb,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { isSafeHref } from "@/lib/url";
import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;
type Resource = NonNullable<Lesson["resources"]>[number];

const resourceIcons: Record<Resource["type"], LucideIcon> = {
  documentation: FileText,
  guide: FileText,
  article: Newspaper,
  download: Download,
  repository: FolderGit2,
};

export function LessonContent({
  summary,
  keyPoints,
  proTip,
  resources,
}: Pick<Lesson, "summary" | "keyPoints" | "proTip" | "resources">) {
  const points = keyPoints ?? [];
  const links = (resources ?? []).filter((resource) => isSafeHref(resource.url));

  return (
    <div className="divide-y divide-neutral-200">
      {summary && (
        <section className="py-8 first:pt-0">
          <h2 className="text-heading-2 font-medium text-neutral-900">Overview</h2>
          <p className="mt-4 max-w-[640px] text-[15px] leading-7 text-neutral-500">{summary}</p>
        </section>
      )}

      {(points.length > 0 || proTip) && (
        <section className="py-8 first:pt-0">
          {points.length > 0 && (
            <>
              <p className="text-[15px] font-medium text-neutral-900">In this lesson you will:</p>
              <ul className="mt-5 space-y-4">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-4 text-[15px] leading-6 text-neutral-700">
                    <CircleCheck aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-primary-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </>
          )}

          {proTip && (
            <aside
              className={cn(
                "flex gap-4 rounded-md border border-primary-200/60 bg-primary-100/60 p-5",
                points.length > 0 && "mt-8",
              )}
            >
              <Lightbulb aria-hidden="true" strokeWidth={1.5} className="size-6 shrink-0 text-primary-500" />
              <div>
                <h3 className="text-base font-medium text-neutral-900">Pro Tip</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{proTip}</p>
              </div>
            </aside>
          )}
        </section>
      )}

      {links.length > 0 && (
        <section className="pb-10 pt-7 first:pt-0">
          <h2 className="text-heading-2 font-medium text-neutral-900">Resources</h2>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {links.map((resource) => (
              <li key={resource._key}>
                <ResourceCard resource={resource} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const onGitHub = resource.type === "repository" && new URL(resource.url).hostname === "github.com";
  const Icon = resourceIcons[resource.type] ?? FileText;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full gap-3 rounded-md border border-neutral-200 bg-white/60 p-4 transition-shadow hover:shadow-md"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary-100 text-primary-500">
        {onGitHub ? (
          <GitHubMark className="size-5 text-neutral-900" />
        ) : (
          <Icon aria-hidden="true" strokeWidth={1.5} className="size-[18px]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-5 text-neutral-900 group-hover:text-primary-500">
          {resource.title}
        </span>
        {resource.description && (
          <span className="mt-2 block text-small leading-5 text-neutral-500">{resource.description}</span>
        )}
      </span>
      <ExternalLink aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0 self-center text-primary-500" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

// lucide-react ships no brand icons.
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
