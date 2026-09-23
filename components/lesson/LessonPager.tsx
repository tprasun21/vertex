import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatDuration } from "@/lib/format";

type PagerLesson = { title: string; slug: string; durationMinutes: number } | null;

export function LessonPager({ previous, next }: { previous: PagerLesson; next: PagerLesson }) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="Lesson navigation" className="border-t border-neutral-200">
      <div className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-3">
        {previous ? (
          <div className="flex min-w-0 items-center gap-7">
            <Link
              href={`/lessons/${previous.slug}`}
              className="inline-flex h-12 shrink-0 items-center gap-3 rounded-md border border-neutral-200 bg-white px-4 text-[15px] font-medium text-neutral-900 transition-colors hover:bg-neutral-100 sm:px-6"
            >
              <ArrowLeft aria-hidden="true" className="size-4 text-neutral-700" />
              <span>
                Previous<span className="hidden sm:inline"> Lesson</span>
              </span>
            </Link>
            <div className="hidden min-w-0 text-[13px] text-neutral-500 sm:block">
              <p className="truncate">{previous.title}</p>
              <p className="mt-1">{formatDuration(previous.durationMinutes)}</p>
            </div>
          </div>
        ) : (
          <span />
        )}

        {next && (
          <div className="flex min-w-0 items-center gap-7">
            <div className="hidden min-w-0 text-right text-[13px] text-neutral-500 sm:block">
              <p className="truncate">{next.title}</p>
              <p className="mt-1">{formatDuration(next.durationMinutes)}</p>
            </div>
            <Link
              href={`/lessons/${next.slug}`}
              className="inline-flex h-12 shrink-0 items-center gap-3 rounded-md bg-primary-500 px-4 text-[15px] font-medium text-white shadow-md transition-colors hover:bg-primary-400 sm:px-6"
            >
              <span>
                Next<span className="hidden sm:inline"> Lesson</span>
              </span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
