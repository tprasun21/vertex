# Implementation prompt: Vertex Design System

> Written retroactively per AGENTS.md section 2. The work described here was already implemented before this prompt existed; logging it now so the repo has the record the workflow expects, and to get your sign-off before touching anything further on this task (e.g. rolling these tokens/components into real catalog/course/lesson pages).

## Goal

Stand up the Vertex design system (`design/vertex-designsystem.png`) as reusable Tailwind tokens and UI primitives, plus a `/design-system` showcase page that mirrors the reference sheet section-for-section, so later pages (catalog, course, lesson, etc.) can be built by reusing these pieces instead of re-deriving styles each time.

## Skills / docs read

- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — confirmed Tailwind v4 + `@theme` setup is unchanged from the existing scaffold.
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` — confirmed `next/font/google` API is unchanged (used for Playfair Display + Inter).
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/typedRoutes.md` — checked whether `LayoutProps<"/">` implied `typedRoutes: true`; it doesn't (not set in `next.config.ts`), so string `href`s on `<Link>` aren't statically checked.
- No Sanity/Clerk/PostHog/search skills were relevant — this task never touched content modeling, auth, or search.

## Code inspected

- `app/layout.tsx`, `app/globals.css`, `app/page.tsx` — starter scaffold (Geist fonts, minimal Tailwind v4 `@theme inline` block).
- `package.json` — Next 16.3.6, React 19.2.8, Tailwind v4, no existing UI/icon library.
- `tsconfig.json` — confirmed `@/*` path alias.
- `design/vertex-designsystem.png` — the source-of-truth reference image (colors, type scale, spacing, radius/shadows, icons, buttons, inputs, badges, status indicators, progress bar, cards, navigation, principles).

## Decisions / assumptions

- No icon library existed; installed `lucide-react` (outline icons, 24×24, 2px stroke by default) as the closest match to the reference's icon spec. Confirmed with you separately and added a "Filled Style" row using `fill="currentColor"` on the same set, since Lucide has no separate filled icon set.
- Implemented tokens as CSS custom properties + Tailwind v4 `@theme` (colors, font families, type scale via `--text-*`, radius, shadow) rather than a `tailwind.config` file, matching the v4 idiom already in the scaffold.
- Spacing: the reference's 4px-base scale (4/8/12/16/24/32/40/48/64) already matches Tailwind's default spacing scale, so no override was added.
- Built a small `components/ui/` primitive set (Button, Input/Select, Badge, StatusIndicator, ProgressBar, Card variants, Navbar, Breadcrumbs, Pagination) rather than a single monolithic page, so future pages (catalog/course/lesson) can compose them per section 3 of AGENTS.md ("reuse the components ... before you add new ones").
- Renamed `Button.tsx`/`Badge.tsx`/`Pagination.tsx` to lowercase (`button.tsx`/`badge.tsx`/`pagination.tsx`) to resolve a case-only filename collision with unrelated files under `agent/skills/create-agent-with-sanity-context/references/...` that `next build`'s type checker picked up via the repo-wide `tsconfig.json` include glob. This is cosmetic (filename casing only) and touches nothing else.

## Files touched

- `app/globals.css` — full token set (colors, type scale, radius, shadow).
- `app/layout.tsx` — swapped Geist fonts for Playfair Display + Inter.
- `app/design-system/page.tsx` — new showcase page.
- `components/ui/button.tsx`, `badge.tsx`, `Input.tsx`, `StatusIndicator.tsx`, `ProgressBar.tsx`, `Card.tsx`, `Navbar.tsx`, `Breadcrumbs.tsx`, `pagination.tsx` — new primitives.
- `lib/cn.ts` — new small classname helper.
- `package.json` / `package-lock.json` — added `lucide-react`.

## Requirements

- Match the reference image's tokens and components: primary/neutral color scale, Playfair Display (display) + Inter (body/UI), the 8-row type scale, 4px spacing scale, radius scale (4/8/12/16/24/full), 4-tier shadow scale, outline + filled icon rows, 4 button variants × default/hover/disabled, search input + select, 3 badge variants, 4 status indicators, a progress bar, 3 card variants (course/lesson/resource), and navbar/breadcrumbs/pagination.
- Reuse existing Tailwind/Next patterns already in the scaffold (Tailwind v4 `@theme`, `next/font/google`) rather than introducing a parallel styling system.
- No functional/data requirements — this is presentation-only (section 7 explicitly lists things like this as presentational).

## Security considerations

None — no server code, no data access, no secrets, no auth surface. Purely static UI/tokens.

## Acceptance criteria

- `/design-system` renders all 11 sections from the reference without visual regressions vs. the source PNG (colors, typography, type scale, spacing, radius/shadows, icons — outline and filled, buttons, inputs, badges/status/progress, cards, navigation).
- Components are generic enough to be reused by future catalog/course/lesson pages, not one-off markup baked into the showcase page.
- No changes outside the design-system scope (confirmed after the "filled icons" follow-up — only the Icons section of the showcase page was touched).

## Checks run

- `next build` type check: fails, but only on pre-existing, unrelated errors in `agent/skills/create-agent-with-sanity-context/references/ecommerce/**` (missing `sanity` module in unrelated reference/example files, not part of this app). Nothing in `app/`, `components/`, or `lib/` errors.
- `next dev` (existing server on :3000): compiles clean, page serves 200, no runtime/hydration errors tied to this work.
- Manual visual check via Playwright screenshot of `/design-system`, compared side-by-side against `design/vertex-designsystem.png`.

## Manual test steps

1. `npm run dev`, open `http://localhost:3000/design-system`.
2. Compare against `design/vertex-designsystem.png` section by section (01–11 in the left rail headers).
3. Hover the four button variants in section 07 — primary/secondary should visibly change background/border color.
4. Resize the window narrower — cards and the two-column sections should reflow (no hard requirement was given for this page's mobile behavior since it's a design reference page, not a shipped product page, but it shouldn't break).
5. Confirm section 06 shows both an "Outline Style" and a "Filled Style" icon row.

---

**Outstanding gap vs. AGENTS.md**: none of the actual product surfaces (Sanity schema, Clerk auth, catalog/course/lesson pages, search, progress, analytics) have been started. This prompt covers only the design-system foundation. The next prompt should scope one of those verticals explicitly before any code is written.
