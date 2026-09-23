# Implementation prompt: Homepage courses from Sanity

## Goal

Replace the hardcoded `courses` array in `app/page.tsx` with seeded Sanity courses, so the "All Courses" cards show real data and link to the new course page (`/courses/[slug]`).

Out of scope: the catalog page (`/courses`), homepage search, and any visual redesign of `CourseCard`.

## Skills and docs read

- AGENTS.md sections 3, 5, 7, and 12.
- `sanity-best-practices`: reuse the existing `defineQuery` / TypeGen / server-only `sanityFetch` pattern. No new query is needed.

## Code inspected

- `app/page.tsx`: a static array of 3 cards (Next.js / Docker / TypeScript) with hand-styled text or emoji icons.
- `components/ui/Card.tsx` → `CourseCard({ icon, iconClassName, title, description, level, duration, modules })`. The icon slot is a 40×40 rounded square that takes any `ReactNode`.
- `lib/sanity/data.ts` → `getCourses()` runs `COURSES_QUERY`, ordered by `popular desc, title asc`. It returns the title, slug, summary, coverImage, level, `moduleCount`, and `durationMinutes`.
- `lib/format.ts` (from the course page task): `formatDuration`, `pluralize`, and `capitalize`.
- `lib/sanity/image.ts` → `urlFor`.
- Seed: 10 courses. Six are popular, and every course has a cover (picsum photos uploaded to Sanity).

## Decisions

1. **Show the first 3 courses from `getCourses()`**, which puts popular courses first, then sorts by title. The design shows exactly 3 cards, and "View all courses" still points to `/courses`.
2. **Icon slot shows the course cover.** It's a `next/image` of `urlFor(coverImage).width(80).height(80)`, cropped with the hotspot, filling the existing 40×40 square. The seed has no logo field, and I'm not adding one: the spec gives the course a cover image, not a separate icon. So the hand-made "N", whale, and "TS" squares go away.
3. **Cards link to `/courses/<slug>`.** Each `CourseCard` is wrapped in a `next/link` with a subtle hover and a focus ring. `CourseCard` itself doesn't change, so `/design-system` isn't affected.
4. **Meta text** comes from the same helpers as the course page:
   - level capitalized (`Intermediate`)
   - `formatDuration(durationMinutes)`
   - `pluralize(moduleCount, "module")`
5. **Data fetching** happens in the Server Component (`Home` becomes `async`). The token stays server-side, and the existing 60s revalidate and tags apply.
6. **Empty state:** if no courses come back, the grid is simply omitted. There's no fake placeholder data.
7. **Hand cursor on everything clickable (user request).** Tailwind v4's preflight resets `<button>` to `cursor: default`, so buttons (module rows, Bookmark, Show all, and so on) show an arrow instead of the hand. Add Tailwind's documented base rule to `app/globals.css`: `button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; }`. Links, including the new card links, already use the hand.

## Files to touch

- `app/page.tsx`: remove the static array, fetch with `getCourses()`, and render linked cards with cover thumbnails.
- `app/globals.css`: add the button cursor base rule.

## Security considerations

- Reads go only through the server-only `sanityFetch`. Nothing new reaches the browser except rendered HTML and public CDN image URLs.

## Acceptance criteria

- `/` shows 3 course cards whose titles, summaries, levels, durations, and module counts match Sanity. They are:
  - Building AI Apps with LLMs
  - Next.js App Router in Depth
  - Python for Data Work
- Each card's icon shows that course's cover image.
- Clicking a card opens `/courses/<slug>` and returns 200.
- There are no hardcoded course strings left in `app/page.tsx`.
- Mobile layout is unchanged (the cards stack).
- Hovering any enabled button or course card shows the hand cursor. Disabled buttons don't.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `next start`, then load `/` and follow a card link

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000/`.
2. Confirm the 3 cards show seeded courses with cover thumbnails.
3. Edit a course summary in Studio. Within about 60s, it should update on the homepage.
4. Click a card and confirm the course page opens.
