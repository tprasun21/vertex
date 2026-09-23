# Implementation prompt: Homepage hero spacing and scale

## Goal

Make the homepage hero (badge, headline, subhead, CTA, search bar) feel more premium. It currently looks small and cramped next to the "All Courses" section below it. Change only padding, margins, and sizing. The design, copy, colors, and structure stay the same (user request).

## Skills and docs read

- AGENTS.md section 3 (no restyling beyond the reference; reuse existing components and tokens).
- No Sanity, auth, or data changes.

## Code inspected

- `app/page.tsx`, the hero `<section>`:
  - one uniform `gap-8` between every element and `py-20 sm:py-24`
  - badge `px-3.5 py-1.5 text-[11px]`
  - `h1` at `sm:text-display-1` (48px)
  - subhead `text-body-lg` (16px), `max-w-xl`
  - CTA `h-11 px-4 text-sm`
  - search wrapper `max-w-2xl`
- `components/ui/Input.tsx`: a fixed 44px height, a 16px icon at `left-3.5`, a small `⌘K` chip, and `className` reaches only the `<input>`. It's also used by `/design-system`, which must not change.
- `design/vertex-home.png`, taking the "All Courses" heading as the 1:1 anchor. Measured against that heading, the reference hero has:
  - a headline about 2.3× the section heading, so about 64px;
  - a subhead about 20px on a 32px line;
  - a CTA about 56px tall;
  - a search bar about 64px tall and about 760px wide;
  - distinct gaps, larger between the text block and the actions than inside the text block.

## Decisions

1. **Rhythm instead of a single gap.** Remove `gap-8` and set per-element margins:

   | Between | Now | New |
   |---|---|---|
   | Section padding | `py-20 sm:py-24` | `pt-16 pb-20 sm:pt-28 sm:pb-32` |
   | Badge → headline | 32px | `mt-8` (32px) |
   | Headline → subhead | 32px | `mt-6` (24px): headline and subhead read as one block |
   | Subhead → CTA | 32px | `mt-10` (40px) |
   | CTA → search | 32px | `mt-12 sm:mt-14` (48 to 56px) |

2. **Scale:**
   - **Badge:** `px-4 py-2`, `text-xs` with wider tracking (`tracking-[0.12em]`).
   - **Headline:** `text-[40px] leading-[1.1]` on mobile, `sm:text-[56px]`, and `lg:text-[64px] lg:leading-[1.08]`, with `max-w-4xl`. Weight and font are unchanged.
   - **Subhead:** `text-body-lg` on mobile, `sm:text-xl sm:leading-8`, and `max-w-2xl` so it wraps into two balanced lines, with `text-balance`.
   - **CTA:** `h-12 px-6 text-base` on mobile, `sm:h-14 sm:px-7`, with `gap-2` and `shadow-md`. Colors and radius are unchanged.
   - **Search:** the wrapper becomes `max-w-3xl`.
3. **`Input` gets an opt-in `size="lg"`.** The `size` attribute is omitted from the native props, and the default stays `"md"`, so `/design-system` is untouched. For `lg`:
   - `h-16` (64px), `text-base`, `pl-14`, `rounded-md`, `shadow-sm`
   - a 20px icon at `left-5`
   - a `⌘K` chip `text-xs px-2 py-1` at `right-4`
   `className` keeps applying to the `<input>`.
4. **Mobile:** smaller top and bottom padding, a 40px headline, and a full-width search bar and CTA. No horizontal scroll at 375px.

## Files to touch

- `app/page.tsx`: hero section classes only.
- `components/ui/Input.tsx`: the `size` prop.

## Security considerations

None. The change is only presentation.

## Acceptance criteria

- At 1280px, the hero:
  - has a noticeably larger headline (about 64px);
  - has a 20px subhead in two balanced lines;
  - has a 56px CTA and a 64px, about 768px wide search bar;
  - has more space above and below;
  - clearly outweighs the "All Courses" section.
- Copy, colors, element order, and structure are unchanged.
- `/design-system` inputs look exactly as before.
- At 375px it stacks cleanly with no horizontal scroll.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `next start` plus before and after screenshots of `/` at 1280px and 390px, and of `/design-system`

## Manual test steps

1. Run `npm run dev`, open `/`, and compare the hero with the "All Courses" section below it.
2. Narrow to about 375px and check the stacking and the headline wrap.
3. Open `/design-system` and confirm the input section is unchanged.
