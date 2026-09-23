# Implementation prompt: match `/courses` to the reference screenshot

## Goal

Restyle `/courses` to match the screenshot the user attached. It has these parts:
- a breadcrumb
- a large bold "All Courses" heading, with "10 courses" right-aligned on the same row
- a 3-column grid of tall vertical cards

Data, routing, and behavior stay unchanged.

## Skills and docs read

- AGENTS.md section 3 (the reference is the source of truth; reuse existing components and tokens).
- No Sanity changes: it's the same `getCourses()` data.

## Reference measurements

The screenshot is about 1.4× CSS px, judging from text sizes against the type tokens. Converted to CSS:

| Element | Reference (≈ CSS) | Tailwind |
|---|---|---|
| Page container | about 1300 wide, centered | `max-w-[1320px] px-6` |
| Breadcrumb | single gray "All Courses", 14px | `Breadcrumbs`-style gray text, `text-sm text-neutral-500` |
| Heading | Playfair bold about 40px, about 50px below breadcrumb | `font-display text-display-2 sm:text-[40px] font-bold`, `mt-10` |
| Count | "10 courses", 14px gray, right, bottom-aligned with heading | `text-sm text-neutral-500`, `flex items-end justify-between` |
| Grid | 3 columns, about 22px gap, heading-to-grid about 36px | `grid lg:grid-cols-3 sm:grid-cols-2 gap-6 mt-9` |
| Card | white, 1px `neutral-200`, radius about 16px, padding 24px | `rounded-lg border bg-white p-6` |
| Cover | 72px square, radius about 12px | `size-[72px] rounded-md overflow-hidden` |
| Title | Playfair bold about 22px, 30px below cover | `font-display text-heading-2 font-bold mt-7` |
| Summary | about 15px, 25px line height, gray, 16px below title | `text-[15px] leading-[25px] text-neutral-500 mt-4` |
| Divider | 1px `neutral-200`, pinned toward the bottom | `mt-auto pt-8` wrapper, then `border-t` |
| Meta row | 12px gray, 3 items spread evenly, icons (bar chart, clock, folder), 20px top padding | `flex justify-between pt-5 text-small`, 14px icons |
| Hover | the card lifts with a shadow, and the cursor is a hand | `hover:shadow-lg transition-shadow` on the link |

## Decisions

1. **New `CourseTile` layout inside `components/course/CourseGrid.tsx`** (vertical card). `components/ui/CourseCard` is left alone, because it's the compact horizontal card from the design-system sheet and `/design-system` still uses it.
2. **Equal-height cards:** the card is a `flex flex-col h-full`, with the divider and meta pushed to the bottom by `mt-auto`, as the reference shows. The meta icon for modules changes from `Layers` to `Folder`, to match.
3. **Homepage:** the homepage uses the same `CourseGrid`, and `design/vertex-home.png` shows this same vertical card (big icon, title, summary, divider, spread-out meta). So the homepage cards change to this layout too, which brings them closer to their own design. See the question in the approval panel.
4. **Page header** in `app/courses/page.tsx`:
   - a breadcrumb row using `Breadcrumbs` with one item and no link. Its current-page style is dark, so I'll pass it as a linked item to `/courses` to get the gray look in the reference.
   - then the heading and count row.
5. **Responsive:** 1 column below `sm`, 2 below `lg`. On mobile the heading drops to `text-display-2`, and the count stays on the same row.

## Files to touch

- `components/course/CourseGrid.tsx`: vertical card markup.
- `app/courses/page.tsx`: header layout and container.

## Security considerations

None new. It's the same server-only reads, and there are no new data or client code.

## Acceptance criteria

- At desktop width, `/courses` visually matches the reference:
  - the header row
  - 3 columns of vertical cards with a 72px cover, bold title, summary, and a bottom-pinned divider with 3 spread-out meta items
  - cards in each row the same height
- Card hover shows a shadow and the hand cursor, and the card opens `/courses/<slug>`.
- The homepage shows its 3 cards in the same vertical style (if approved).
- `/design-system` is unchanged.
- No horizontal scroll at 375px.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `next start` plus desktop and mobile screenshots of `/courses` and `/`

## Manual test steps

1. Run `npm run dev` and open `/courses`. Compare it against the reference screenshot.
2. Hover a card to see the shadow and the hand cursor, then click it to open the course page.
3. Open `/` and check the 3 cards. Open `/design-system` and confirm its Course Card is unchanged.
4. Narrow to about 375px and confirm a single column with no horizontal scroll.
