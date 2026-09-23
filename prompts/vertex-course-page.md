# Implementation prompt: Course Detail Page

## Goal

Build `/courses/[slug]` from `design/vertex-course.png`, rendering real seeded Sanity content: breadcrumbs, a cover-plus-header hero (popular badge, title, summary, meta row, CTA and Bookmark), a "What you'll learn" grid, an expandable "Course Content" module list with a "Show all N modules" control, and the sticky "Your Progress" bar.

Out of scope: progress storage and the resume position (their own feature), bookmarks, the catalog (`/courses`), the lesson page, analytics events, and search.

## Skills and docs read

- AGENTS.md sections 3, 5, 7, 8, and 12.
- `sanity-best-practices`: the existing `defineQuery` / TypeGen / server-only fetch pattern is already in place, and this task reuses it without adding queries.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md` and `page.md`: `params` is a `Promise` and is typed with the global `PageProps<'/courses/[slug]'>` helper. Use `generateStaticParams`, `generateMetadata`, and `notFound()`.

## Code and data inspected

- `design/vertex-course.png`: the reference.
- `lib/sanity/data.ts` → `getCourseBySlug(slug)` already returns everything the page needs. It returns the title, summary, coverImage, level, popular, studentCount, learningOutcomes (icon, title, description), `moduleCount`, and `durationMinutes`. It also returns the modules with `number`, summary, summed `durationMinutes`, and published lessons (title, slug, durationMinutes, freePreview). `getCourseSlugs()` exists for static params.
- `lib/sanity/image.ts` (`urlFor`), and `next.config.ts` (already allows `cdn.sanity.io`).
- `components/ui/`: `Navbar` (bell and Clerk `UserButton`), `Breadcrumbs`, `Badge` (the `lesson` variant is the light-orange pill the design uses for POPULAR), `Button` (`primary` and `tertiary`), `ProgressBar`, and `cn`.
- `app/page.tsx`: homepage conventions (`bg-neutral-50`, `max-w-[1440px]`, `font-display` headings, lucide icons) and the decorative gradient bars.
- `studio/schemaTypes/objects/learning-outcome.ts`: the outcome `icon` values are lucide names (layers, database, gauge, cloud, code, shield, zap, rocket, book-open, terminal, server, lock, workflow, sparkles, puzzle).
- Seed: 10 courses, each with 4 modules of 3 lessons, and 4 learning outcomes. Covers are picsum photos (landscape) uploaded as Sanity assets. Six courses are marked popular.

## Decisions and assumptions

1. **Route `app/courses/[slug]/page.tsx`**, a Server Component with `generateStaticParams` from `getCourseSlugs()` and `generateMetadata` (title and summary). An unknown slug calls `notFound()`. Data stays server-side through the existing `sanityFetch` with a 60s revalidate.
2. **Lesson links go to `/lessons/[slug]`.** Lesson slugs are globally unique, and `getLessonBySlug` already resolves the course by reverse reference. That route will 404 until the lesson page is built.
3. **Progress is presentational only (user decision).** Both CTAs keep the design's "Continue Learning" label and link to the course's first lesson. The sticky bar renders exactly as designed for every visitor, with no Clerk gating, and shows `0% complete` because no progress is stored yet. `CourseProgressBar` takes a `percent` prop, so the progress feature can wire real data in later.
4. **Links anyway (user decision).** "All Courses" goes to `/courses`, and lessons go to `/lessons/<slug>`. Both 404 until their own tasks, and no placeholder pages are added here.
5. **Bookmark is presentational.** It's a `tertiary` button with no handler or backend. The spec (section 1) doesn't include bookmarks, so it's flagged under "Needs your attention" rather than being built.
6. **"Course Content" is a small client component** (`components/course/CourseContent.tsx`). Each module row is an accordion (a button with `aria-expanded`) that reveals its lessons: the derived label `1.1`, the title, the duration, a "Free preview" label, and a link. The list shows the first 6 modules, and "Show all N modules" appears only when there are more than 6. The seed has 4 modules per course, so the control won't appear with seeded data.
7. **"What you'll learn" icons** come from a static map of the 15 lucide components, keyed by the schema's icon value. There's no dynamic icon loading. The section is hidden when a course has no outcomes.
8. **Formatting helpers** go in `lib/format.ts`:
   - `formatDuration(minutes)` gives `45m`, `1h 12m`, or `18h 24m`.
   - `formatCount(n)` gives `2.1k` (compact, lowercase).
   - `pluralize` gives `12 modules` and `1 module`.
   - Level is capitalized (`Intermediate`).
   The student count is hidden when it's null.
9. **Cover:** `next/image` from `urlFor(coverImage).width(560).height(640)`, cropped with the hotspot. It fills a rounded box that sits at about 280×326 on desktop, with alt text from the image's `alt`, falling back to the course title.
10. **Visual fidelity:** match the reference layout, spacing, and color using the existing tokens. The breadcrumb current-page item is gray in the reference, so `Breadcrumbs` gets no change. Its existing bold dark style stays so the homepage and design-system pages don't regress. That's a minor deviation, noted here. The bottom decorative gradient bars reuse the homepage's gradient styling.
11. **Instructor:** the reference has no instructor slot, so it's left off this page, which matches the design (user decision).
12. **Responsive:**
    - Below `lg`, the hero stacks (cover above the text, with a smaller cover).
    - The outcomes grid goes to 1 column below `md`.
    - Module rows wrap the duration under the text on narrow screens.
    - The progress bar stacks its label, bar, and button and stays sticky.
    - There's no horizontal scroll at 375px.

## Files to touch

- `app/courses/[slug]/page.tsx` (new): page, `generateStaticParams`, `generateMetadata`.
- `components/course/CourseContent.tsx` (new, client): module accordion and show-all.
- `components/course/CourseProgressBar.tsx` (new): the sticky "Your Progress" bar (server component, presentational).
- `components/course/OutcomeIcon.tsx` (new): lucide map.
- `lib/format.ts` (new): duration, count, and plural helpers.

No new dependencies, and no schema or query changes.

## Requirements

- Desktop matches `design/vertex-course.png`. Mobile adapts as described above.
- Everything shown comes from Sanity: title, summary, badge, level, total duration, module count, students, outcomes, modules, per-module durations, and lessons. No hardcoded course content.
- Module and lesson numbers are derived from order.
- Reuse `Navbar`, `Breadcrumbs`, `Badge`, `Button` styling, and the tokens.

## Security considerations

- All reads go through the server-only `sanityFetch`. The token never reaches the client.
- The client component only receives plain serializable module and lesson data (no token and no client).
- The page stays public. It does no auth checks and no writes.

## Acceptance criteria

- `/courses/nextjs-app-router-in-depth` renders:
  - the seeded title, summary, and POPULAR badge;
  - "Intermediate", the summed duration, "4 modules", and the compact student count;
  - 4 outcome cards with the correct icons;
  - 4 module rows with per-module durations that add up to the header total.
- Clicking a module row expands it and lists its 3 lessons with labels (`1.1`–`1.3`), durations, and free-preview labels. Clicking again collapses it.
- A non-popular course (for example `react-performance-engineering`) shows no badge.
- An unknown slug returns the 404 page.
- The sticky progress bar shows `0% complete` and "Continue Learning", which links to the first lesson.
- There's no horizontal scroll at 375px width, and there are no console errors.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (new route with static params)
- `npm run dev`, then load the route and a 404 slug

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000/courses/nextjs-app-router-in-depth`.
2. Compare against `design/vertex-course.png`: breadcrumbs, hero, outcomes, course content, and progress bar.
3. Expand and collapse a module, then click a lesson. It goes to `/lessons/<slug>`, which is a 404 until the lesson page exists.
4. Open `/courses/react-performance-engineering` and confirm there's no POPULAR badge and the level is "Advanced".
5. Open `/courses/does-not-exist` and confirm the 404.
6. Scroll the page and confirm the progress bar stays pinned to the bottom and its button goes to the first lesson.
7. Resize to about 375px and confirm the layout stacks with no horizontal scroll.
