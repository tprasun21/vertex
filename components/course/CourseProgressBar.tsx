"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import posthog from "posthog-js";

// Presentational until learner progress is stored; the page passes 0 for now.
export function CourseProgressBar({ percent, href }: { percent: number; href: string | null }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className="sticky bottom-4 z-10 mx-auto w-full max-w-[1100px] px-4 sm:px-6">
      <div className="flex flex-col gap-4 rounded-md border border-neutral-200 bg-white px-5 py-4 shadow-lg sm:flex-row sm:items-center sm:gap-10 sm:px-6">
        <div className="flex flex-1 items-center gap-6 sm:gap-10">
          <div className="shrink-0">
            <p className="text-small text-neutral-500">Your Progress</p>
            <p className="mt-1 text-sm text-neutral-900">
              <span className="font-medium">{clamped}%</span> complete
            </p>
          </div>
          <div
            role="progressbar"
            aria-label="Course progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clamped}
            className="h-1.5 w-full max-w-[280px] rounded-full bg-neutral-200"
          >
            <div
              className="h-full rounded-full bg-primary-500 transition-[width]"
              style={{ width: `${clamped}%` }}
            />
          </div>
        </div>
        {href && (
          <Link
            href={href}
            onClick={() =>
              posthog.capture("course_learning_continued", {
                progress_percent: clamped,
              })
            }
            className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-primary-500 px-7 text-sm font-medium text-white shadow-md transition-colors hover:bg-primary-400"
          >
            Continue Learning
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
