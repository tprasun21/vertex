import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CourseGrid } from "@/components/course/CourseGrid";
import { getCourses } from "@/lib/sanity/data";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = {
  title: "All Courses | Vertex",
  description: "Browse every course on Vertex.",
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Navbar />

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <Breadcrumbs items={[{ label: "All Courses", href: "/courses" }]} />

        <div className="mt-8 flex items-end justify-between gap-4 sm:mt-10">
          <h1 className="font-display text-display-2 font-bold text-neutral-900 sm:text-[40px] sm:leading-[48px]">
            All Courses
          </h1>
          <p className="shrink-0 pb-1 text-sm text-neutral-500">{pluralize(courses.length, "course")}</p>
        </div>

        <div className="mt-9">
          {courses.length > 0 ? (
            <CourseGrid courses={courses} />
          ) : (
            <p className="text-body text-neutral-500">No courses yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
