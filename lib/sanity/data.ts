import "server-only";

import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

import { sanityFetch } from "./fetch";
import {
  CATEGORIES_QUERY,
  COURSE_BY_SLUG_QUERY,
  COURSE_SLUGS_QUERY,
  COURSES_QUERY,
  INSTRUCTOR_BY_SLUG_QUERY,
  INSTRUCTOR_SLUGS_QUERY,
  LESSON_BY_SLUG_QUERY,
  LESSON_SLUGS_QUERY,
} from "./queries";

// Every page that renders a course also shows lesson, instructor, and category
// fields, so all content reads share these tags.
const CONTENT_TAGS = ["course", "lesson", "instructor", "category"];

type LessonCourse = NonNullable<NonNullable<LESSON_BY_SLUG_QUERY_RESULT>["course"]>;
type OutlineLesson = LessonCourse["modules"][number]["lessons"][number];

export function getCourses() {
  return sanityFetch({ query: COURSES_QUERY, tags: CONTENT_TAGS });
}

export async function getCourseBySlug(slug: string) {
  const course = await sanityFetch({ query: COURSE_BY_SLUG_QUERY, params: { slug }, tags: CONTENT_TAGS });
  if (!course) return null;

  return {
    ...course,
    modules: (course.modules ?? []).map((module, index) => ({
      ...module,
      number: index + 1,
      // Unpublished lesson references resolve to null under the published perspective.
      lessons: (module.lessons ?? []).filter(Boolean),
    })),
  };
}

export async function getLessonBySlug(slug: string) {
  const lesson = await sanityFetch({ query: LESSON_BY_SLUG_QUERY, params: { slug }, tags: CONTENT_TAGS });
  if (!lesson?.course) return null;

  const { course, ...rest } = lesson;
  const modules = (course.modules ?? []).map((module, moduleIndex) => ({
    ...module,
    number: moduleIndex + 1,
    lessons: (module.lessons ?? []).filter(Boolean).map((item, lessonIndex) => ({
      ...item,
      label: `${moduleIndex + 1}.${lessonIndex + 1}`,
    })),
  }));

  const sequence = modules.flatMap((module) =>
    module.lessons.map((item) => ({ ...item, moduleNumber: module.number })),
  );
  const position = sequence.findIndex((item) => item._id === lesson._id);
  if (position === -1) return null;

  const current = sequence[position];
  const toLink = (item: OutlineLesson | undefined) =>
    item ? { _id: item._id, title: item.title, slug: item.slug, durationMinutes: item.durationMinutes } : null;

  return {
    ...rest,
    label: current.label,
    module: modules[current.moduleNumber - 1],
    course: { ...course, modules },
    previous: toLink(sequence[position - 1]),
    next: toLink(sequence[position + 1]),
  };
}

export function getInstructorBySlug(slug: string) {
  return sanityFetch({ query: INSTRUCTOR_BY_SLUG_QUERY, params: { slug }, tags: CONTENT_TAGS });
}

export function getCategories() {
  return sanityFetch({ query: CATEGORIES_QUERY, tags: ["category", "course"] });
}

export function getCourseSlugs() {
  return sanityFetch({ query: COURSE_SLUGS_QUERY, tags: ["course"] });
}

export function getLessonSlugs() {
  return sanityFetch({ query: LESSON_SLUGS_QUERY, tags: ["lesson"] });
}

export function getInstructorSlugs() {
  return sanityFetch({ query: INSTRUCTOR_SLUGS_QUERY, tags: ["instructor"] });
}
