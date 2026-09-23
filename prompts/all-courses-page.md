# Implementation prompt: All Courses page, plus a bolder course title

## Goal

1. Build `/courses`, a simple catalog that lists every seeded Sanity course as a linked card. The navbar "Courses" link, the homepage "Explore Courses" and "View all courses" links, and the course page's "All Courses" breadcrumb all point here and currently 404.
2. Make the course title on `/courses/[slug]` bolder.

Keep it simple (user request). There are no filters, no sorting, no search, and no pagination: there are only 10 courses.

## Skills and docs read

- AGENTS.md sections 3, 5, 7, and 12.
- `sanity-best-practices`: reuse the existing `getCourses()` / `COURSES_QUERY` through the server-only `sanityFetch`. No new query.

## Code inspected

- There's no design image for the catalog (`design/` has home, course, lesson, search, and design system). So the page reuses the homepage "All Courses" section styling: `font-display text-heading-1` heading, `max-w-[1440px] px-6`, and a 1/2/3-column grid of `CourseCard`.
- `app/page.tsx`: homepage cards are `CourseCard`s wrapped in a `Link`, with the cover as the icon and meta from `lib/format.ts`.
- `app/courses/[slug]/page.tsx`: the title `h1` currently uses `font-medium`.
- `lib/sanity/data.ts` → `getCourses()` returns all courses, popular first, then by title.

## Decisions

1. **Extract the homepage card grid into `components/course/CourseGrid.tsx`** (server component, user decision). It takes `COURSES_QUERY_RESULT` items and renders the responsive 1/2/3-column grid of linked `CourseCard`s, with the cover thumbnail and formatted meta. The homepage (first 3 courses) and the catalog (all courses) both use it. Homepage output stays identical.
2. **`app/courses/page.tsx`** contains:
   - the `Navbar`
   - an "All Courses" `h1` (same style as the homepage heading)
   - a one-line count, for example `10 courses`
   - the grid of all courses
   - `metadata` title "All Courses | Vertex"
   If there are no courses, it shows a short "No courses yet." line.
3. **Course title weight:** in `/courses/[slug]`, change the `h1` from `font-medium` to `font-bold`. That's the display-1 token's weight, which the homepage hero also uses.

## Files to touch

- `app/courses/page.tsx` (new)
- `components/course/CourseGrid.tsx` (new)
- `app/page.tsx`: use `CourseGrid`
- `app/courses/[slug]/page.tsx`: title weight

## Security considerations

- Reads go only through the server-only `sanityFetch`. The page is public, with no auth and no writes.

## Acceptance criteria

- `/courses` returns 200 and lists all 10 seeded courses, popular first, each with a cover, summary, level, duration, and module count.
- Every card opens `/courses/<slug>` (200).
- The navbar "Courses", "Explore Courses", "View all courses", and the breadcrumb all land on `/courses`.
- The homepage still shows the same 3 cards.
- The course page title renders bold.
- Cards stack to 1 column on mobile, with no horizontal scroll.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `next start`, then curl `/courses` and every card link

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000/courses`. Confirm 10 cards.
2. Click a card, confirm the course page opens with a bold title, then click the "All Courses" breadcrumb to return.
3. Open `/` and confirm the 3 homepage cards are unchanged.
4. Narrow to about 375px and confirm the cards stack.
