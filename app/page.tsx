import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Input } from "@/components/ui/Input";
import { CourseCard } from "@/components/ui/Card";

const courses = [
  {
    icon: "N",
    iconClassName: "bg-neutral-900 font-display text-lg font-bold text-white",
    title: "Next.js for Production",
    description: "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate",
    duration: "18h 24m",
    modules: "12 modules",
  },
  {
    icon: "🐳",
    iconClassName: "bg-sky-50 text-xl",
    title: "Docker Essentials",
    description: "Containerize applications and streamline your development workflow.",
    level: "Beginner",
    duration: "10h 12m",
    modules: "8 modules",
  },
  {
    icon: "TS",
    iconClassName: "bg-[#3178c6] font-display text-lg font-bold text-white",
    title: "TypeScript Deep Dive",
    description: "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate",
    duration: "14h 36m",
    modules: "10 modules",
  },
];

const barHeights = [64, 96, 128, 88, 56, 40, 72, 112, 144, 100, 60];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Navbar />

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center gap-8 border-b border-neutral-200 px-6 py-20 text-center sm:py-24">
          <span className="rounded-full border border-primary-200 bg-primary-100 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-500">
            Intelligent Learning
          </span>

          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-neutral-900 sm:text-display-1">
            Search your learning
            <br className="hidden sm:block" /> in plain English.
          </h1>

          <p className="max-w-xl text-body-lg text-neutral-500">
            Vertex understands what you want to learn and finds the exact lessons across
            all your courses.
          </p>

          <Link
            href="/courses"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-400"
          >
            Explore Courses
            <ArrowRight className="size-4" />
          </Link>

          <div className="w-full max-w-2xl">
            <label htmlFor="homepage-search" className="sr-only">
              Ask anything about your learning
            </label>
            <Input
              id="homepage-search"
              placeholder="Ask anything about your learning..."
              hint="⌘K"
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-6 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-heading-1 font-semibold text-neutral-900">
              All Courses
            </h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-400"
            >
              View all courses
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.title}
                icon={course.icon}
                iconClassName={course.iconClassName}
                title={course.title}
                description={course.description}
                level={course.level}
                duration={course.duration}
                modules={course.modules}
              />
            ))}
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-6">
          <span className="h-px flex-1 bg-neutral-200" />
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-neutral-500">
            <Star className="size-4 text-primary-500" />
            New courses and lessons added every week.
          </span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <div className="mt-16 flex h-40 items-end justify-center gap-3 overflow-hidden px-6 sm:gap-4">
          {barHeights.map((height, i) => (
            <span
              key={i}
              className="w-8 rounded-t-sm bg-gradient-to-b from-primary-200 to-primary-400/0 sm:w-12"
              style={{ height }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
