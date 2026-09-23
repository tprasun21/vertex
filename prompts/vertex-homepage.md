# Implementation prompt: Vertex Homepage

## Goal

Replace the Create-Next-App placeholder at `app/page.tsx` with the Vertex homepage from `design/vertex-home.png`: navbar, hero (eyebrow badge, display headline, subhead, CTA, search input), an "All Courses" section with three course cards, a divider line with a callout, and a decorative gradient-bar footer band.

## Skills / docs read

- Skipped `sanity-best-practices` / Clerk / PostHog skills — this page reads no Sanity content and has no auth or analytics wiring; it is pure presentation per AGENTS.md section 7 ("browsing public", "pages ... are read only").
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` — confirmed `next/font/google` usage already in `app/layout.tsx` is unchanged; no new font work needed (Playfair + Inter already wired).

## Code inspected

- `design/vertex-home.png` — the reference image (source of truth for layout/spacing/type/color).
- `app/page.tsx` — current Create-Next-App boilerplate to replace.
- `app/layout.tsx`, `app/globals.css` — confirmed design tokens (`--color-primary-*`, `--color-neutral-*`, `text-display-1`, `text-heading-*`, `text-body*`, radius/shadow scale) and fonts (`font-display` = Playfair, `font-sans` = Inter) are already in place from the design-system work.
- `components/ui/Navbar.tsx` — existing navbar (logo mark, Courses / My Learning links). Matches the reference header closely; reused as-is (reference also shows a bell icon and avatar on the right, which the current Navbar doesn't render).
- `components/ui/button.tsx` — `Button` with `primary` variant (orange fill) matches the "Explore Courses" CTA.
- `components/ui/Input.tsx` — `Input` already renders a search icon + placeholder; reference search bar also shows a `⌘K` hint on the right, which the current component doesn't support.
- `components/ui/Card.tsx` — `CourseCard` (icon, title, description, level, duration, modules via lucide icons) matches the "All Courses" cards almost exactly.
- `components/ui/badge.tsx` — not used on this page (no badges on homepage cards).
- `lib/cn.ts` — classname helper, reused.
- `prompts/vertex-design-system.md` — prior prompt; confirms these primitives are meant to be composed, not re-derived.

## Decisions / assumptions

- **Navbar right side (bell + avatar):** the reference shows a notification bell and a user avatar circle. AGENTS.md section 7 lists "the notifications bell" as presentational-only with no backend. There's no Clerk integration yet in this task's scope (that's a separate vertical per AGENTS.md section 1). I'll extend `Navbar` to optionally render a static bell icon + placeholder avatar image, presentational only, no auth state, so the header matches the design now and can be swapped for real Clerk `UserButton`/notification data later without changing layout.
- **`⌘K` hint in the search input:** I'll add an optional `hint` prop to the existing `Input` component (renders a small kbd-style badge on the right) rather than forking a homepage-only input, so other pages can reuse it.
- **Course data:** no Sanity catalog exists yet. The three cards (Next.js for Production, Docker Essentials, TypeScript Deep Dive) will be a local static array in `app/page.tsx`, clearly placeholder, matching AGENTS.md's "pages are read only, they display stored data" — until the catalog vertical exists, static data is the honest stand-in and nothing here fakes a backend call.
- **Course icons:** the reference uses small brand marks (N / whale emoji / TS) on colored square backgrounds. I'll reproduce them as plain styled squares with text/emoji (no icon library has these brand marks), matching color per card (black, blue-ish, blue) as in the image.
- **Decorative gradient bars at the bottom:** static CSS (a row of `div`s with a linear-gradient background and varying heights), not an image asset, so it stays crisp and themeable. This is purely decorative chrome from the reference, non-interactive.
- **"View all courses" / "Explore Courses" links:** point to `/courses` (matches `Navbar`'s existing `Courses` link target); that route doesn't exist yet, which is fine for a presentational homepage — no functional requirement to build the catalog page in this task.
- Mobile responsiveness: reference is desktop-only per AGENTS.md section 3, so I'll adapt sensibly — stack the course cards to one column, shrink the display headline, keep the navbar links visible (no hamburger, only 2 links so it fits).

## Files touched

- `app/page.tsx` — full rewrite as the homepage.
- `components/ui/Navbar.tsx` — add optional bell + avatar slot on the right.
- `components/ui/Input.tsx` — add optional `hint` prop (e.g. `⌘K`) rendered inside the input on the right.

No new dependencies.

## Requirements

- Match `design/vertex-home.png` layout, spacing, typography, and color exactly at desktop width.
- Responsive down to mobile: course cards stack to a single column, headline/subhead scale down, hero padding reduces, search bar and CTA stay full-width-friendly.
- Reuse `Navbar`, `Button`, `Input`, `CourseCard` from `components/ui/` rather than inventing new one-off markup.
- No backend calls, no auth, no analytics — static presentational page only.

## Security considerations

None. No data fetching, no secrets, no user input persisted (search input is uncontrolled/non-functional on this page — wiring it to the real search route is a separate, later task per AGENTS.md section 11).

## Acceptance criteria

- `/` renders navbar, hero (eyebrow, headline, subhead, CTA, search bar with `⌘K` hint), "All Courses" heading + "View all courses" link, 3 course cards, divider callout, and gradient bar footer — visually matching the reference at desktop width.
- Resizing to mobile width reflows cleanly: no horizontal scroll, cards stack, text remains legible.
- No console/runtime errors; existing `/design-system` page still renders unchanged.

## Checks run (after implementation)

- `npm run lint`
- `npx tsc --noEmit` (or `next build` type-check portion) — scoped to `app/`, `components/`, `lib/` since the repo has known unrelated errors under `agent/skills/**` reference files (per prior prompt).
- `npm run dev` and manual visual check against `design/vertex-home.png`.

## Manual test steps

1. `npm run dev`, open `http://localhost:3000/`.
2. Compare against `design/vertex-home.png`: header, hero copy/CTA/search bar, 3 course cards, divider row, gradient bars.
3. Click "Explore Courses" and "View all courses" — both should navigate to `/courses` (404 expected until that route exists; just confirming the link target).
4. Resize the browser to ~375px width — confirm cards stack vertically, headline shrinks, no horizontal scrollbar.
5. Confirm `/design-system` still renders correctly (Navbar/Input changes are additive, shouldn't break it).
