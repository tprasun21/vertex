import { Bell, Search, PlayCircle, FileText, Bookmark, BarChart2, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CourseCard, LessonCard, ResourceCard } from "@/components/ui/Card";
import { Navbar } from "@/components/ui/Navbar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Pagination } from "@/components/ui/pagination";

const colors = {
  Primary: [
    ["Primary 500", "#F97316"],
    ["Primary 400", "#FB923C"],
    ["Primary 300", "#FDBA74"],
    ["Primary 200", "#FED7AA"],
    ["Primary 100", "#FFEEE5"],
  ],
  Neutral: [
    ["Neutral 900", "#0F172A"],
    ["Neutral 700", "#33415F"],
    ["Neutral 500", "#64748B"],
    ["Neutral 300", "#CBD5E1"],
    ["Neutral 200", "#E2E8F0"],
    ["Neutral 100", "#F1F5F9"],
    ["Neutral 50", "#FAFAFC"],
    ["White", "#FFFFFF"],
  ],
};

const typeScale = [
  ["Display 1", "Playfair Display", "48 / 56", "Bold"],
  ["Display 2", "Playfair Display", "36 / 44", "Bold"],
  ["Heading 1", "Inter", "28 / 36", "Semi Bold"],
  ["Heading 2", "Inter", "22 / 30", "Semi Bold"],
  ["Heading 3", "Inter", "18 / 26", "Medium"],
  ["Body Large", "Inter", "16 / 24", "Regular"],
  ["Body", "Inter", "14 / 20", "Regular"],
  ["Small", "Inter", "12 / 16", "Regular"],
];

const spacing = [4, 8, 12, 16, 24, 32, 40, 48, 64];

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        <span className="text-primary-500">{number}</span> {title}
      </h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-full bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="mb-1 text-small font-semibold uppercase tracking-wide text-primary-500">
          Version 1.0 · September 2026
        </p>
        <h1 className="font-display text-display-1 font-bold text-neutral-900">
          Design System
        </h1>
        <p className="mt-3 max-w-xl text-body-lg text-neutral-500">
          A unified design language for Vertex learning platform. Clean, modern and focused
          on clarity, consistency and intuitive learning experiences.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section number="01" title="Colors">
            {Object.entries(colors).map(([group, swatches]) => (
              <div key={group} className="mb-6 last:mb-0">
                <p className="mb-2 text-small font-medium text-neutral-500">{group}</p>
                <div className="flex flex-wrap gap-3">
                  {swatches.map(([name, hex]) => (
                    <div key={name} className="w-20">
                      <div
                        className="mb-1 h-16 w-full rounded-sm border border-neutral-200"
                        style={{ background: hex }}
                      />
                      <p className="text-[11px] font-medium text-neutral-900">{name}</p>
                      <p className="text-[11px] text-neutral-500">{hex}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          <Section number="02" title="Typography">
            <p className="font-display text-display-1 font-bold text-neutral-900">Ag</p>
            <p className="text-body text-neutral-500">Playfair Display · Elegant · Timeless</p>
            <p className="mt-4 text-display-1 font-bold text-neutral-900">Ag</p>
            <p className="text-body text-neutral-500">Inter · Clean · Modern · Highly legible</p>
          </Section>
        </div>

        <div className="mt-6">
          <Section number="03" title="Type Scale">
            <table className="w-full text-left text-body">
              <thead>
                <tr className="text-small text-neutral-500">
                  <th className="pb-2 font-medium">Style</th>
                  <th className="pb-2 font-medium">Font</th>
                  <th className="pb-2 font-medium">Size / Line Height</th>
                  <th className="pb-2 font-medium">Weight</th>
                </tr>
              </thead>
              <tbody>
                {typeScale.map(([style, font, size, weight]) => (
                  <tr key={style} className="border-t border-neutral-100">
                    <td className="py-2 font-medium text-neutral-900">{style}</td>
                    <td className="py-2 text-neutral-500">{font}</td>
                    <td className="py-2 text-neutral-500">{size}</td>
                    <td className="py-2 text-neutral-500">{weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section number="04" title="Spacing System">
            <p className="mb-4 text-small text-neutral-500">Base unit: 4px</p>
            <div className="flex flex-wrap items-end gap-3">
              {spacing.map((s) => (
                <div key={s} className="text-center">
                  <div
                    className="mb-1 rounded-xs bg-primary-200"
                    style={{ width: s, height: s }}
                  />
                  <p className="text-[11px] text-neutral-500">{s}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section number="05" title="Radius &amp; Shadows">
            <div className="mb-6 flex flex-wrap gap-3">
              {[
                ["xs", "radius-xs"],
                ["sm", "radius-sm"],
                ["md", "radius-md"],
                ["lg", "radius-lg"],
                ["xl", "radius-xl"],
                ["full", "radius-full"],
              ].map(([label, token]) => (
                <div key={label} className="text-center">
                  <div
                    className="mb-1 size-12 border border-neutral-200 bg-neutral-100"
                    style={{ borderRadius: `var(--${token})` }}
                  />
                  <p className="text-[11px] text-neutral-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["sm", "md", "lg", "xl"].map((s) => (
                <div
                  key={s}
                  className="rounded-sm border border-neutral-100 p-4 text-small text-neutral-500"
                  style={{ boxShadow: `var(--shadow-${s})` }}
                >
                  Shadow {s}
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="mt-6">
          <Section number="06" title="Icons">
            <p className="mb-2 text-small font-medium text-neutral-500">Outline Style</p>
            <div className="mb-6 flex flex-wrap gap-6 text-neutral-700">
              {[Bell, Search, PlayCircle, FileText, Bookmark, BarChart2, Clock, User].map(
                (Icon, i) => (
                  <Icon key={i} className="size-6" strokeWidth={2} />
                )
              )}
            </div>
            <p className="mb-2 text-small font-medium text-neutral-500">Filled Style</p>
            <div className="flex flex-wrap gap-6 text-neutral-700">
              {[Bell, Search, PlayCircle, FileText, Bookmark, BarChart2, Clock, User].map(
                (Icon, i) => (
                  <Icon key={i} className="size-6" fill="currentColor" />
                )
              )}
            </div>
          </Section>
        </div>

        <div className="mt-6">
          <Section number="07" title="Buttons">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary">Get Started</Button>
              <Button variant="secondary">Explore Courses</Button>
              <Button variant="tertiary">View Lesson</Button>
              <Button variant="text">Watch Video</Button>
              <Button variant="primary" disabled>
                Get Started
              </Button>
            </div>
          </Section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section number="08" title="Inputs">
            <div className="flex flex-col gap-4">
              <Input placeholder="Search anything..." />
              <Select defaultValue="most-relevant">
                <option value="most-relevant">Most Relevant</option>
                <option value="newest">Newest</option>
              </Select>
            </div>
          </Section>

          <Section number="09" title="Badges / Status / Progress">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="video">Video</Badge>
              <Badge variant="lesson">Lesson</Badge>
              <Badge variant="popular">Popular</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <StatusIndicator status="in-progress" />
              <StatusIndicator status="completed" />
              <StatusIndicator status="now-playing" />
              <StatusIndicator status="locked" />
            </div>
            <div className="mt-4">
              <ProgressBar value={35} />
            </div>
          </Section>
        </div>

        <div className="mt-6">
          <Section number="10" title="Cards">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <CourseCard
                icon={<span className="font-display font-bold">N</span>}
                title="Next.js for Production"
                description="Build scalable, high-performance web applications with Next.js."
                level="Intermediate"
                duration="18h 24m"
                modules="12 modules"
              />
              <LessonCard
                badge="video"
                title="Data Fetching in Server Components"
                description="Learn how to fetch data on the server using async/await and Next.js best practices."
                meta="Lesson 5.1 · 12:45"
                action="Watch from 12:45"
              />
              <ResourceCard
                title="Caching and Revalidation Guide"
                description="Deep dive into Next.js caching strategies."
                meta="PDF · 1.2 MB"
              />
            </div>
          </Section>
        </div>

        <div className="mt-6">
          <Section number="11" title="Navigation">
            <div className="flex flex-col gap-4">
              <Breadcrumbs
                items={[
                  { label: "All Courses", href: "/courses" },
                  { label: "Next.js for Production", href: "/courses/nextjs" },
                  { label: "Data Fetching & Caching" },
                ]}
              />
              <Pagination page={1} totalPages={8} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
