"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

type SidebarLesson = { _id: string; title: string; slug: string; durationMinutes: number };

export type SidebarModule = {
  _key: string;
  number: number;
  title: string;
  durationMinutes: number;
  lessons: SidebarLesson[];
};

type SidebarCourse = { title: string; slug: string; coverUrl: string; coverAlt: string };

// Progress is presentational until learner progress is stored; the page passes 0.
export function LessonSidebar({
  course,
  modules,
  currentModuleNumber,
  currentLessonId,
  percent,
}: {
  course: SidebarCourse;
  modules: SidebarModule[];
  currentModuleNumber: number;
  currentLessonId: string;
  percent: number;
}) {
  const outlineId = useId();
  const currentIndex = currentModuleNumber - 1;
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  // Mobile only: the outline collapses behind "Module X of Y". Desktop always shows it.
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [open, setOpen] = useState<Set<string>>(() => new Set([modules[currentIndex]?._key]));

  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const moduleLabel = `Module ${currentModuleNumber} of ${modules.length}`;

  return (
    <aside
      aria-label="Course outline"
      className="shrink-0 border-b border-neutral-200 lg:w-[320px] lg:self-start lg:rounded-bl-md lg:border-l"
    >
      <div className="px-4 pb-5 pt-6 sm:px-6 lg:pt-10">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-2.5 font-display text-[15px] text-primary-500 transition-colors hover:text-primary-400"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to course
        </Link>

        <div className="mt-7 flex items-center gap-4">
          <span className="relative size-[60px] shrink-0 overflow-hidden rounded-sm bg-neutral-900">
            <Image src={course.coverUrl} alt={course.coverAlt} fill sizes="60px" className="object-cover" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-medium leading-5 text-neutral-900">{course.title}</p>
            <p className="mt-1.5 text-[13px] leading-4 text-neutral-500">{clamped}% complete</p>
            <div
              role="progressbar"
              aria-label="Course progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clamped}
              className="mt-2 h-[3px] w-[84px] rounded-full bg-neutral-200"
            >
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${clamped}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <button
          type="button"
          aria-expanded={outlineOpen}
          aria-controls={outlineId}
          onClick={() => setOutlineOpen((value) => !value)}
          className="flex w-full items-center justify-between px-4 py-4 text-sm font-medium text-neutral-900 sm:px-6 lg:hidden"
        >
          {moduleLabel}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 text-primary-500 transition-transform", outlineOpen && "rotate-180")}
          />
        </button>
        <p className="hidden items-center justify-between px-6 py-4 text-sm font-medium text-neutral-900 lg:flex">
          {moduleLabel}
          <ChevronDown aria-hidden="true" className="size-4 text-primary-500" />
        </p>

        <ol id={outlineId} className={cn(outlineOpen ? "block" : "hidden", "lg:block")}>
          {modules.map((module, index) => (
            <ModuleItem
              key={module._key}
              module={module}
              isCurrent={index === currentIndex}
              // Modules up to the current one form a single timeline; later ones are divided.
              connectAbove={index > 0 && index <= currentIndex}
              connectBelow={index < currentIndex}
              divided={index >= currentIndex}
              isOpen={open.has(module._key)}
              onToggle={() => toggle(module._key)}
              currentLessonId={currentLessonId}
            />
          ))}
        </ol>
      </div>
    </aside>
  );
}

function ModuleItem({
  module,
  isCurrent,
  connectAbove,
  connectBelow,
  divided,
  isOpen,
  onToggle,
  currentLessonId,
}: {
  module: SidebarModule;
  isCurrent: boolean;
  connectAbove: boolean;
  connectBelow: boolean;
  divided: boolean;
  isOpen: boolean;
  onToggle: () => void;
  currentLessonId: string;
}) {
  const panelId = useId();
  const showLessons = isOpen && module.lessons.length > 0;

  return (
    <li className={cn(divided && "border-t border-neutral-200", isCurrent && "bg-primary-100/40")}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full gap-4 px-5 text-left"
      >
        <TimelineColumn above={connectAbove} below={connectBelow || showLessons} markerTop="50%">
          <span
            className={cn(
              "flex size-8 -translate-y-1/2 items-center justify-center rounded-full border text-sm",
              isCurrent
                ? "border-primary-500 bg-primary-500 font-medium text-white"
                : "border-neutral-200 bg-white text-neutral-700",
            )}
          >
            {module.number}
          </span>
        </TimelineColumn>
        <span className="min-w-0 flex-1 py-5">
          <span className="block text-sm font-medium leading-5 text-neutral-900">{module.title}</span>
          <span className="mt-1 block text-[13px] leading-4 text-neutral-500">
            {formatDuration(module.durationMinutes)}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 shrink-0 self-center text-primary-500 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {showLessons && (
        <ol id={panelId} className="pb-3">
          {module.lessons.map((lesson, index) => {
            const isLast = index === module.lessons.length - 1;
            const isCurrentLesson = lesson._id === currentLessonId;
            const body = (
              <>
                <TimelineColumn above below={!isLast || connectBelow} markerTop="15px">
                  <span
                    className={cn(
                      "block -translate-y-1/2 rounded-full",
                      isCurrentLesson ? "size-1.5 bg-primary-500" : "size-2 border border-neutral-300 bg-white",
                    )}
                  />
                </TimelineColumn>
                <span className="min-w-0 flex-1 py-2">
                  <span
                    className={cn(
                      "block text-[13px] leading-5",
                      isCurrentLesson
                        ? "font-medium text-neutral-900"
                        : "text-neutral-500 transition-colors group-hover:text-primary-500",
                    )}
                  >
                    {lesson.title}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[13px] leading-5",
                      isCurrentLesson ? "text-primary-500" : "text-neutral-500",
                    )}
                  >
                    {isCurrentLesson ? "Now playing" : formatDuration(lesson.durationMinutes)}
                  </span>
                </span>
                {isCurrentLesson && (
                  <span className="mt-2 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                    <Play aria-hidden="true" className="size-3 translate-x-px fill-current" />
                  </span>
                )}
              </>
            );

            return (
              <li key={lesson._id}>
                {isCurrentLesson ? (
                  <div aria-current="page" className="flex gap-4 px-5">
                    {body}
                  </div>
                ) : (
                  <Link href={`/lessons/${lesson.slug}`} className="group flex gap-4 px-5">
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </li>
  );
}

// A fixed-width column holding a marker on the vertical timeline. The line
// segments run edge to edge so neighbouring rows join into one line.
function TimelineColumn({
  above,
  below,
  markerTop,
  children,
}: {
  above: boolean;
  below: boolean;
  markerTop: string;
  children: React.ReactNode;
}) {
  return (
    <span aria-hidden="true" className="relative w-8 shrink-0 self-stretch">
      {above && <span className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-neutral-200" style={{ height: markerTop }} />}
      {below && (
        <span className="absolute bottom-0 left-1/2 w-px -translate-x-1/2 bg-neutral-200" style={{ top: markerTop }} />
      )}
      <span className="absolute left-1/2 flex -translate-x-1/2 justify-center" style={{ top: markerTop }}>
        {children}
      </span>
    </span>
  );
}
