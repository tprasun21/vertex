import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BarChart2, Bookmark, Clock, Users } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonNotes } from "@/components/lesson/LessonNotes";
import { LessonPager } from "@/components/lesson/LessonPager";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";
import { LessonTabs } from "@/components/lesson/LessonTabs";
import { LessonVideo, LessonVideoFallback } from "@/components/lesson/LessonVideo";
import { LessonViewTracker } from "@/components/lesson/LessonViewTracker";
import { getLessonBySlug, getLessonSlugs } from "@/lib/sanity/data";
import { urlFor } from "@/lib/sanity/image";
import { capitalize, formatDuration } from "@/lib/format";

const fullCount = new Intl.NumberFormat("en");

export async function generateStaticParams() {
  const lessons = await getLessonSlugs();
  return lessons.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/lessons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) return {};
  return { title: `${lesson.title} | Vertex`, description: lesson.summary ?? undefined };
}

export default async function LessonPage({ params }: PageProps<"/lessons/[slug]">) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) notFound();

  const { course, module } = lesson;
  const poster = lesson.thumbnail?.asset
    ? urlFor(lesson.thumbnail).width(1280).height(720).fit("crop").url()
    : null;

  const meta = [
    { icon: Clock, label: formatDuration(lesson.durationMinutes) },
    { icon: BarChart2, label: capitalize(course.level) },
    ...(lesson.studentCount != null
      ? [{ icon: Users, label: `${fullCount.format(lesson.studentCount)} students` }]
      : []),
  ];

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Navbar />
      <LessonViewTracker
        lesson_id={lesson._id}
        lesson_slug={lesson.slug}
        lesson_label={lesson.label}
        lesson_duration_minutes={lesson.durationMinutes}
        module_number={module.number}
        course_id={course._id}
        course_slug={course.slug}
      />

      <div className="mx-auto flex w-full max-w-[1140px] flex-1 flex-col lg:flex-row">
        <LessonSidebar
          key={lesson._id}
          course={{
            title: course.title,
            slug: course.slug,
            coverUrl: urlFor(course.coverImage).width(112).height(112).fit("crop").url(),
            coverAlt: course.coverImage.alt || course.title,
          }}
          modules={course.modules}
          currentModuleNumber={module.number}
          currentLessonId={lesson._id}
          percent={0}
        />

        <main className="min-w-0 flex-1 px-4 pt-8 sm:px-6 lg:border-l lg:border-neutral-200 lg:px-11 lg:pt-10">
          <Breadcrumbs
            items={[
              { label: "All Courses", href: "/courses" },
              { label: course.title, href: `/courses/${course.slug}` },
              { label: module.title },
              { label: lesson.title },
            ]}
          />

          <header className="mt-10">
            <Badge variant="lesson">Lesson {lesson.label}</Badge>
            <div className="mt-5 flex items-start justify-between gap-6">
              <h1 className="font-display text-3xl font-bold leading-tight text-neutral-900 sm:text-[40px] sm:leading-[48px]">
                {lesson.title}
              </h1>
              <button
                type="button"
                aria-label="Bookmark lesson"
                className="flex size-11 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-primary-500 transition-colors hover:bg-neutral-100"
              >
                <Bookmark aria-hidden="true" className="size-5" />
              </button>
            </div>
            {lesson.summary && (
              <p className="mt-4 max-w-[560px] text-body-lg leading-[30px] text-neutral-500">{lesson.summary}</p>
            )}
            <ul className="mt-6 flex flex-wrap items-center gap-x-9 gap-y-3 text-[13px] text-neutral-500">
              {meta.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2.5">
                  <Icon aria-hidden="true" className="size-4 text-neutral-700" />
                  {label}
                </li>
              ))}
            </ul>
          </header>

          <div className="mt-7">
            <Suspense fallback={<LessonVideoFallback posterUrl={poster} />}>
              <LessonVideo videoUrl={lesson.videoUrl} title={lesson.title} />
            </Suspense>
          </div>

          <div className="mt-10">
            <LessonTabs
              key={lesson._id}
              tabs={[
                {
                  id: "content",
                  label: "Lesson Content",
                  panel: (
                    <LessonContent
                      summary={lesson.summary}
                      keyPoints={lesson.keyPoints}
                      proTip={lesson.proTip}
                      resources={lesson.resources}
                    />
                  ),
                },
                { id: "notes", label: "Notes", panel: <LessonNotes notes={lesson.notes} /> },
              ]}
            />
          </div>
        </main>
      </div>

      <LessonPager previous={lesson.previous} next={lesson.next} />
    </div>
  );
}
