# Implementation prompt: Navbar fits on phones

## Goal

Stop the shared `Navbar` from being wider than a phone screen. Today, a signed-out visitor below about 408px sees the "Sign up" button cut off, and every page scrolls sideways. The fix applies on all pages (home, catalog, course, lesson, design system). Desktop and tablet (`sm` and up) stay exactly as they are.

Out of scope: a hamburger or drawer menu, restyling the navbar, and any change at `sm` and above.

## Skills and docs read

- AGENTS.md section 3: there is no mobile reference, so adapt sensibly and keep desktop exact. Section 7: the notifications bell is presentational only, with no backend.
- No Sanity, Clerk, or Next.js API changes are involved. This is Tailwind classes only.

## Code inspected and measured

- `components/ui/Navbar.tsx`: one `flex justify-between gap-2` row inside `px-4`, with three parts:
  - the logo mark and "Vertex" wordmark;
  - the "Courses" and "My Learning" links (`gap-4`, `whitespace-nowrap`);
  - the bell (36px), then either "Sign up" (signed out, with "Sign in" already hidden below `sm`) or the Clerk `UserButton` (signed in, about 28px).
- Measured in headless Chromium on `/`, signed out:
  - logo 79px, links 155px, right group 126px, plus 16px of gaps: **376px needed**;
  - space available is the viewport width minus 32px of padding: 288px at 320, 328 at 360, 343 at 375, 358 at 390, 382 at 414;
  - so it overflows on every phone narrower than about 408px, which includes 360, 375, 390 and 393.
- Signed in, it needs about 322px, so it also overflows at 320.

## Decisions

1. **Hide the bell below `sm`** (`hidden sm:flex`). It is presentational only, so phones lose no function. This saves 44px, bringing signed out to 332px and signed in to 278px.
2. **Hide the "Vertex" wordmark below 375px** (`hidden min-[375px]:inline`). The orange logo mark stays and still links home. This saves 55px, bringing signed out to 277px, which fits 320. From 375px up the wordmark shows, and there's 11px to spare at 375.
3. **Tighten the link gap below `sm`** from `gap-4` to `gap-3` for a few pixels of extra room. It's back to `gap-6` at `sm`, as today.
4. The wordmark stays `sm:text-lg`, the links stay the same size, and there's no hamburger. The two links and the sign-up button all still fit at 320px.
5. Everything at `sm` (640px) and up renders the same classes as today, so desktop is pixel-identical.

## Files to touch

- `components/ui/Navbar.tsx` (classes only)

## Requirements

- At 320, 360, 375, 390 and 414px, signed out and signed in, the navbar fits inside the viewport. `document.documentElement.scrollWidth` equals the viewport width on `/`, `/courses`, a course page and a lesson page.
- At 640px and 1280px the navbar looks the same as before.

## Security considerations

- None. This is a presentational class change: no auth, data, or env changes.

## Acceptance criteria

- At 375px signed out: logo mark, "Vertex", "Courses", "My Learning" and "Sign up" are all visible, with no bell and no sideways scroll.
- At 320px signed out: logo mark, both links and "Sign up" are visible, with no wordmark and no sideways scroll.
- At 640px and up: the bell, the wordmark and "Sign in" are back, as before.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- Headless Chromium: measure the navbar and `scrollWidth` at 320, 360, 375, 390, 414, 640 and 1280px on `/`, `/courses`, `/courses/nextjs-app-router-in-depth` and `/lessons/nextjs-app-router-in-depth-caching-and-revalidation`, and take a screenshot at 375px.

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000/` while signed out.
2. In DevTools, switch to an iPhone SE (375px) layout. Sign up is fully visible and the page doesn't scroll sideways.
3. Set the width to 320px. The wordmark hides, the logo mark stays, and there's still no sideways scroll.
4. Sign in and repeat at 320px: the avatar is fully visible.
5. Widen to 640px and up. The bell, "Sign in" and the wordmark are back, the same as before.
