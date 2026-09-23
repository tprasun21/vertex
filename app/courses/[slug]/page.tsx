import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BarChart2, Bookmark, Clock, FileText, Users } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseContent } from "@/components/course/CourseContent";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";
import { OutcomeIcon } from "@/components/course/OutcomeIcon";
import { getCourseBySlug, getCourseSlugs } from "@/lib/sanity/data";
import { urlFor } from "@/lib/sanity/image";
import { capitalize, formatCount, formatDuration, pluralize } from "@/lib/format";

const barHeights = [72, 112, 152, 96, 64, 0, 0, 0, 0, 0, 56, 104, 144, 88, 120];

export async function generateStaticParams() {
  const courses = await getCourseSlugs();
  return courses.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return { title: `${course.title} | Vertex`, description: course.summary };
}

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const firstLesson = course.modules.flatMap((module) => module.lessons)[0];
  const startHref = firstLesson ? `/lessons/${firstLesson.slug}` : null;
  const outcomes = course.learningOutcomes ?? [];
  const cover = urlFor(course.coverImage).width(560).height(652).fit("crop").url();

  const meta = [
    { icon: BarChart2, label: capitalize(course.level) },
    { icon: Clock, label: formatDuration(course.durationMinutes) },
    { icon: FileText, label: pluralize(course.moduleCount, "module") },
    ...(course.studentCount != null
      ? [{ icon: Users, label: `${formatCount(course.studentCount)} students` }]
      : []),
  ];

  return (
    <div className="relative flex flex-1 flex-col bg-neutral-50">
      <Navbar />

      <main className="relative z-[1] mx-auto w-full max-w-[1100px] flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pt-10">
        <Breadcrumbs items={[{ label: "All Courses", href: "/courses" }, { label: course.title }]} />

        <section className="mt-8 flex flex-col gap-8 sm:mt-10 lg:flex-row lg:items-start lg:gap-16">
          <div className="relative aspect-[280/326] w-40 shrink-0 overflow-hidden rounded-md bg-neutral-900 shadow-md sm:w-56 lg:w-[280px]">
            <Image
              src={cover}
              alt={course.coverImage.alt || course.title}
              fill
              priority
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 224px, 160px"
              className="object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-col items-start">
            {course.popular && <Badge variant="lesson">Popular</Badge>}
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-neutral-900 sm:text-display-1">
              {course.title}
            </h1>
            <p className="mt-5 max-w-md text-body-lg leading-[30px] text-neutral-500">{course.summary}</p>

            <ul className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-neutral-500">
              {meta.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon aria-hidden="true" className="size-4 text-neutral-700" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {startHref && (
                <Link
                  href={startHref}
                  className="inline-flex h-[52px] items-center justify-center gap-3 rounded-md bg-primary-500 px-6 text-sm font-medium text-white shadow-md transition-colors hover:bg-primary-400"
                >
                  Continue Learning
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              )}
              <Button variant="tertiary" type="button" className="h-[52px] gap-3 bg-white px-6">
                <Bookmark aria-hidden="true" className="size-4" />
                Bookmark
              </Button>
            </div>
          </div>
        </section>

        {outcomes.length > 0 && (
          <section className="mt-12 rounded-lg border border-neutral-200 bg-white/60 p-5 sm:p-7">
            <h2 className="text-heading-2 font-medium text-neutral-900">What you&rsquo;ll learn</h2>
            <ul className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              {outcomes.map((outcome) => (
                <li
                  key={outcome._key}
                  className="flex items-start gap-6 rounded-md border border-neutral-200 bg-white px-6 py-7 sm:gap-8"
                >
                  <OutcomeIcon name={outcome.icon} className="size-12 shrink-0 text-primary-500" />
                  <div>
                    <h3 className="text-heading-3 text-neutral-900">{outcome.title}</h3>
                    {outcome.description && (
                      <p className="mt-2 text-body leading-6 text-neutral-500">{outcome.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-heading-2 font-medium text-neutral-900">Course Content</h2>
            <p className="text-[13px] text-neutral-500">
              {pluralize(course.moduleCount, "module")}
              <span aria-hidden="true" className="mx-2">
                •
              </span>
              {formatDuration(course.durationMinutes)}
            </p>
          </div>
          <CourseContent modules={course.modules} />
        </section>
      </main>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex h-40 items-end justify-between gap-2 overflow-hidden px-2 sm:gap-4"
      >
        {barHeights.map((height, i) => (
          <span
            key={i}
            className="w-8 rounded-t-sm bg-gradient-to-t from-primary-200 to-primary-200/0 sm:w-12"
            style={{ height }}
          />
        ))}
      </div>

      <CourseProgressBar percent={0} href={startHref} />
      <div className="h-6" />
    </div>
  );
}
