"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, PlayCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

type ContentLesson = {
  _id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  freePreview: boolean | null;
};

export type ContentModule = {
  _key: string;
  number: number;
  title: string;
  summary: string | null;
  durationMinutes: number;
  lessons: ContentLesson[];
};

const INITIAL_VISIBLE = 6;

export function CourseContent({ modules }: { modules: ContentModule[] }) {
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const hasMore = modules.length > INITIAL_VISIBLE;
  const visible = showAll ? modules : modules.slice(0, INITIAL_VISIBLE);

  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className={cn("relative", hasMore && "pb-5")}>
      <ul className="overflow-hidden rounded-md border border-neutral-200 bg-white">
        {visible.map((module) => {
          const isOpen = open.has(module._key);
          const panelId = `module-${module._key}`;
          return (
            <li key={module._key} className="border-b border-neutral-200 last:border-b-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(module._key)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-neutral-50 sm:gap-6 sm:px-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 font-display text-base text-neutral-900">
                  {module.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] leading-6 text-neutral-900">
                    {module.title}
                  </span>
                  {module.summary && (
                    <span className="block text-small text-neutral-500 sm:text-[13px] sm:leading-5">
                      {module.summary}
                    </span>
                  )}
                  <span className="mt-1 block text-small text-neutral-500 sm:hidden">
                    {formatDuration(module.durationMinutes)}
                  </span>
                </span>
                <span className="hidden shrink-0 text-sm text-neutral-500 sm:block">
                  {formatDuration(module.durationMinutes)}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0 text-neutral-700 transition-transform sm:ml-4",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen && (
                <ol id={panelId} className="border-t border-neutral-100 bg-neutral-50 px-4 py-2 sm:pl-[88px] sm:pr-14">
                  {module.lessons.map((lesson, index) => (
                    <li key={lesson._id}>
                      <Link
                        href={`/lessons/${lesson.slug}`}
                        className="group flex items-center gap-3 rounded-sm py-2 text-sm"
                      >
                        <PlayCircle aria-hidden="true" className="size-4 shrink-0 text-neutral-500 group-hover:text-primary-500" />
                        <span className="w-8 shrink-0 text-neutral-500">
                          {module.number}.{index + 1}
                        </span>
                        <span className="min-w-0 flex-1 text-neutral-700 group-hover:text-primary-500">
                          {lesson.title}
                        </span>
                        {lesson.freePreview && (
                          <span className="hidden shrink-0 rounded-xs bg-primary-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-500 sm:inline">
                            Free preview
                          </span>
                        )}
                        <span className="shrink-0 text-neutral-500">
                          {formatDuration(lesson.durationMinutes)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((value) => !value)}
            className="inline-flex h-11 items-center gap-3 rounded-sm border border-neutral-200 bg-white px-6 text-sm text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50"
          >
            {showAll ? "Show fewer modules" : `Show all ${modules.length} modules`}
            <ChevronDown
              aria-hidden="true"
              className={cn("size-4 text-neutral-700 transition-transform", showAll && "rotate-180")}
            />
          </button>
        </div>
      )}
    </div>
  );
}
