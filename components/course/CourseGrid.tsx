"use client";

import Image from "next/image";
import Link from "next/link";
import { BarChart2, Clock, Folder } from "lucide-react";
import posthog from "posthog-js";
import { capitalize, formatDuration, pluralize } from "@/lib/format";
import { urlFor } from "@/lib/sanity/image";
import type { COURSES_QUERY_RESULT } from "@/sanity.types";

type Course = COURSES_QUERY_RESULT[number];

export function CourseGrid({ courses }: { courses: COURSES_QUERY_RESULT }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseTile key={course._id} course={course} />
      ))}
    </div>
  );
}

function CourseTile({ course }: { course: Course }) {
  const meta = [
    { icon: BarChart2, label: capitalize(course.level) },
    { icon: Clock, label: formatDuration(course.durationMinutes) },
    { icon: Folder, label: pluralize(course.moduleCount, "module") },
  ];

  return (
    <Link
      href={`/courses/${course.slug}`}
      onClick={() =>
        posthog.capture("course_selected", {
          course_id: course._id,
          course_slug: course.slug,
          course_level: course.level,
          course_duration_minutes: course.durationMinutes,
          course_module_count: course.moduleCount,
          course_popular: course.popular,
        })
      }
      className="flex h-full flex-col rounded-lg border border-neutral-200 bg-white p-6 shadow-sm outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      <span className="relative size-[72px] shrink-0 overflow-hidden rounded-md bg-neutral-100">
        <Image
          src={urlFor(course.coverImage).width(144).height(144).fit("crop").url()}
          alt={course.coverImage.alt || course.title}
          fill
          sizes="72px"
          className="object-cover"
        />
      </span>

      <h3 className="mt-7 font-display text-heading-2 font-bold text-neutral-900">{course.title}</h3>
      <p className="mt-4 text-[15px] leading-[25px] text-neutral-500">{course.summary}</p>

      <div className="mt-auto pt-8">
        <ul className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-5 text-small text-neutral-500">
          {meta.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Icon aria-hidden="true" className="size-3.5" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
