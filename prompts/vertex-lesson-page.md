# Implementation prompt: Lesson Page

## Goal

Build `/lessons/[slug]` from `design/vertex-lesson.png`, rendering real seeded Sanity content, with the lesson's video playing on the page in the provider's own embedded player.

The page has:
- a left course outline sidebar: Back to course, the course block with progress, "Module X of Y", and a module timeline with the current module expanded and the current lesson marked "Now playing";
- breadcrumbs, a `LESSON 5.1` badge, the title, the summary, a meta row, and a Bookmark button;
- the video embed;
- "Lesson Content" and "Notes" tabs;
- a Previous / Next lesson footer.

Out of scope:
- storing progress, completion marks, and the resume position (the progress feature);
- bookmarks;
- video play and watch-depth analytics (they need the provider player APIs, so they ship with progress);
- the video document and ingestion pipeline;
- search.

## Skills and docs read

- AGENTS.md sections 3, 5, 7, 8, 9, 11, and 12.
- `sanity-best-practices` (`SKILL.md`, `references/portable-text.md`): render Portable Text with `PortableText` from `next-sanity` (it re-exports `@portabletext/react` 6.2, so no new dependency). Use a typed `components` object for block styles, lists, marks, and image blocks. Video stays on a streaming provider, and Sanity stores only the URL.
- `portable-text-serialization/rules/react.md`: `components` shape and link-mark handling.
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md`:
  - In a prerendered route, `useSearchParams` client-renders up to the nearest `<Suspense>`.
  - A production build fails if that `<Suspense>` is missing.
  - This lets the page stay static while the `?t=` start second is read on the client.
- Existing route conventions from `app/courses/[slug]/page.tsx`: `PageProps<'/lessons/[slug]'>`, `params` as a Promise, `generateStaticParams`, `generateMetadata`, and `notFound()`.
- Bunny Stream embed docs (bunny.net/docs/stream/embedding): the iframe accepts `?t=<seconds>` as the start time.

## Code and data inspected

- `design/vertex-lesson.png`: the reference. I cropped and zoomed it to read the spacing, the sidebar states, and the colors.
- `lib/sanity/data.ts` → `getLessonBySlug(slug)` already returns everything the page needs:
  - the lesson fields: title, summary, notes, keyPoints, proTip, resources, videoUrl, thumbnail, durationMinutes, studentCount;
  - the derived `label` (`3.2`);
  - the current `module` (with `number`);
  - the course (title, slug, coverImage, level, and modules with `number`, summed `durationMinutes`, and lessons with a `label`);
  - `previous` and `next` across module boundaries.
  The course comes from a reverse reference. `getLessonSlugs()` exists for static params. **No query or schema changes are needed.**
- `studio/schemaTypes/documents/lesson.ts`:
  - `summary` is documented as "shown under the lesson title and as the overview".
  - `videoUrl` is restricted to YouTube, Vimeo, and Bunny hosts.
  - `notes` is `blockContent`, which has normal, h2, h3, and blockquote styles, bullet and number lists, strong, em, and code marks, link annotations, and image blocks.
- Live dataset (queried with the read token): 10 courses and 120 lessons.
  - Every lesson has a YouTube `watch?v=` URL, 3 key points, and 1–2 resources (documentation or guide).
  - 34 lessons have a pro tip.
  - Notes follow the pattern intro, h2, 3 bullets, outro.
  - Courses have 4 modules of 3 lessons each.
- `components/ui/`: `Navbar`, `Breadcrumbs` (keyed by label, so a module and a lesson with the same title would collide), `Badge` (`lesson` variant = the `LESSON 5.1` pill), `Button` (`tertiary`), and `cn`.
- `components/course/CourseContent.tsx` and `CourseProgressBar.tsx`: accordion, progress-bar, and `posthog.capture` conventions (snake_case event and property names).
- `lib/format.ts` (`formatDuration`, `capitalize`), `lib/sanity/image.ts` (`urlFor`), and `next.config.ts` (`cdn.sanity.io` is allowed; there's no CSP).
- lucide-react 1.47 has no brand icons, so there's no `Github` icon.

## Decisions and assumptions

1. **Route `app/lessons/[slug]/page.tsx`**, a Server Component.
   - `generateStaticParams` comes from `getLessonSlugs()`.
   - `generateMetadata` uses the lesson title and summary.
   - An unknown slug, or a lesson that no course references, calls `notFound()`.
   - The page is public, with no auth gating. Free preview stays a label only, per AGENTS section 7.
2. **Content mapping:**

   | Design area | Source |
   |---|---|
   | Subtitle under the title, and "Overview" | `summary` (per the approved content model) |
   | "In this lesson you will" | `keyPoints` |
   | Pro Tip box | `proTip` (the box is hidden when empty) |
   | Resources | `resources` |
   | **Notes tab** | the lesson's Portable Text `notes` |

   The Notes tab only displays stored notes. It has no per-learner note-taking, so it stays "presentational only" as AGENTS section 7 requires. The Overview, key points, pro tip, and resources sections are each hidden when their data is empty.
3. **Meta row:**
   - the lesson duration (`formatDuration`);
   - the course level (capitalized), since a lesson has no level of its own;
   - the lesson student count, in full with a thousands separator (`3,426 students`, as in the design) and hidden when it's null.
4. **Breadcrumbs:**
   - The items are All Courses → course → module → lesson.
   - All Courses and the course are links. The module and the lesson are plain, so they look alike, as in the design.
   - `Breadcrumbs` keeps its existing styling (same trade-off as the course page). Its React key changes to index plus label, so duplicate titles don't collide.
5. **Video playback (`components/lesson/LessonVideo.tsx`, client).** This uses the provider's own player in an iframe. There's no custom player, and the design's control bar *is* the provider's player chrome.
   - `lib/video.ts` → `getVideoEmbed(url, startSeconds)` parses the stored URL into a validated provider id and builds the embed `src` itself. The raw URL never becomes an iframe `src`.
   - Supported forms and start parameters:
     - **YouTube:** `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, and `/live/`. It embeds `https://www.youtube-nocookie.com/embed/<id>?rel=0&start=<s>`.
     - **Vimeo:** `vimeo.com/<id>[/<hash>]` and `player.vimeo.com/video/<id>?h=`. It embeds `https://player.vimeo.com/video/<id>?h=<hash>#t=<s>s`.
     - **Bunny:** `iframe.mediadelivery.net` and `player.mediadelivery.net`, with `/embed/` or `/play/<library>/<guid>`. It embeds `https://iframe.mediadelivery.net/embed/<lib>/<guid>?t=<s>`.
   - Vimeo and Bunny are included because the schema already accepts them. The seed only exercises YouTube. Ingestion for any provider is still pending (AGENTS section 9).
   - **Start second:** the embed reads `?t=<seconds>` from the page URL with `useSearchParams` (a non-negative integer; anything else is ignored). This is the contract search results will link with (AGENTS section 7), and the learner never leaves the site.
   - The component sits inside `<Suspense>`, so the page stays statically generated. The fallback is the same 16:9 black frame showing the lesson `thumbnail`, so the first paint isn't blank.
   - iframe attributes:
     - a `title`;
     - an `allow` list that includes fullscreen, encrypted-media, and picture-in-picture;
     - `allowFullScreen`;
     - `referrerPolicy="strict-origin-when-cross-origin"`, because YouTube embeds fail without a referrer.
   - An unrecognized URL shows a "This video can't be played here" message inside the frame instead of a broken iframe.
6. **Sidebar (`components/lesson/LessonSidebar.tsx`, client):**
   - Back to course (a link to `/courses/<slug>`).
   - The course cover thumbnail and title.
   - The progress line and bar.
   - "Module X of Y".
   - The module list:
     - **Module row:** a number circle, title, duration, and a chevron that toggles the module's lesson list. The current module is open by default, has a tinted background and a filled primary circle, and its chevron points up.
     - **Timeline:** modules before the current one are joined by a vertical connector with no dividers. The line runs through the current module's lesson dots. Modules after the current one are separated by dividers, as in the design.
     - **Lesson row:** a timeline dot, the title, and the duration. The current lesson has a filled dot, "Now playing", and the primary play badge. Other lessons are links to `/lessons/<slug>`.
7. **Progress is presentational (same as the course page).**
   - The sidebar receives `percent={0}` and shows `0% complete` with an empty bar.
   - There are no completion check marks yet. Rows that would show a check show the chevron, until the progress feature supplies completed lessons.
8. **Tabs (`components/lesson/LessonTabs.tsx`, client)** follow the WAI-ARIA tabs pattern:
   - `tablist`, `tab`, and `tabpanel` roles, `aria-selected`, and `aria-controls`;
   - roving `tabIndex` with Left, Right, Home, and End keys;
   - both panels are server-rendered and passed in as slots, and the inactive panel uses `hidden`.

   "Lesson Content" is active by default.
9. **Notes rendering (`components/lesson/LessonNotes.tsx`, server):**
   - `PortableText` with typed components: `p`, `h2`, `h3`, `blockquote`, bullet and number lists, `strong`, `em`, `code`, and `link`.
   - Links open in a new tab with `rel="noopener noreferrer"`, and only `http(s):` and `mailto:` hrefs are rendered as links.
   - Image blocks use `next/image`, with dimensions parsed from the asset ref.
   - An empty state shows when there are no notes. There's no Tailwind typography plugin (it isn't installed), so the styles are explicit, which keeps the design's type.
10. **Resources:**
    - The cards use a 3-column grid.
    - Icons by `type`:
      - documentation and guide → `FileText`;
      - article → `Newspaper`;
      - download → `Download`;
      - repository → an inline GitHub mark when the host is `github.com`, otherwise `FolderGit2`.
    - Each whole card is an external link (`target="_blank"`, `rel="noopener noreferrer"`) with the external-link icon.
11. **Footer (`components/lesson/LessonPager.tsx`, server):**
    - "Previous Lesson" is an outlined button, followed by the previous lesson's title and duration.
    - On the right are the next lesson's title and duration, then the primary "Next Lesson" button.
    - Navigation crosses module boundaries.
    - Each side is omitted when there is no previous or next lesson.
    - It's a static footer, not sticky, as in the reference.
12. **Bookmark** is a presentational `tertiary` icon button (`aria-label="Bookmark lesson"`) with no handler, the same as the course page.
13. **Analytics:** `LessonViewTracker` (client) captures `lesson_viewed` once per lesson (guarded against Strict Mode double effects).
    - Properties: `lesson_id`, `lesson_slug`, `lesson_label`, `lesson_duration_minutes`, `module_number`, `course_id`, and `course_slug`.
    - Video play and watch depth need the YouTube, Vimeo, or Bunny player APIs. They're deferred to the progress feature, which needs the same player time for the resume position.
14. **Instructor:** the reference has no instructor slot, so it's left off, matching the course page decision.
15. **Visual fidelity:**
    - Match the reference layout, spacing, and states using the existing tokens (primary-500, neutral scale, radii, and `font-display` for headings, tabs, and Back to course), as the course page did. The design's warmer terracotta renders as the token primary.
    - Desktop body: `max-w-[1140px]`. The sidebar is `320px` with left and bottom borders and a rounded bottom-left corner. The main column has a left divider and `px-11`.
    - Title at 40/48.
    - The video is a 16:9 frame with `rounded-md`.
    - The outer decorative frame and background texture in the mockup are not reproduced, which is consistent with the course and catalog pages.
16. **Responsive (below `lg`):**
    - The sidebar stacks above the content and collapses. Back to course, the course block, and a "Module X of Y" toggle stay visible, and the module list opens on tap. Desktop always shows the list, and the row there is static text, so no control does nothing.
    - The title drops to about 30px.
    - The meta row wraps.
    - Resources go to 1 column, then 2 at `sm`, then 3 at `md`.
    - The footer hides the lesson titles below `sm` and shortens the buttons to "Previous" and "Next".
    - There's no horizontal scroll at 375px.
17. **Client navigation between lessons:** the stateful client components are keyed by lesson `_id`, so the open module, tab, and outline state reset for each lesson.

## Files to touch

- `app/lessons/[slug]/page.tsx` (new): page, `generateStaticParams`, `generateMetadata`.
- `components/lesson/LessonSidebar.tsx` (new, client): outline, timeline, and module accordion.
- `components/lesson/LessonVideo.tsx` (new, client): provider embed, `?t=` start, and the fallback frame.
- `components/lesson/LessonTabs.tsx` (new, client): accessible tabs with server-rendered panels.
- `components/lesson/LessonContent.tsx` (new, server): overview, key points, pro tip, and resources.
- `components/lesson/LessonNotes.tsx` (new, server): the Portable Text notes.
- `components/lesson/LessonPager.tsx` (new, server): the Previous / Next footer.
- `components/lesson/LessonViewTracker.tsx` (new, client): the `lesson_viewed` event.
- `lib/video.ts` (new): the provider URL parser and embed `src` builder.
- `components/ui/Breadcrumbs.tsx`: key only.

No new dependencies, no env changes, and no schema, query, or TypeGen changes.

## Requirements

- Desktop matches `design/vertex-lesson.png`. Mobile adapts as described above.
- Everything shown comes from Sanity. Module and lesson numbers are derived from order.
- The seeded YouTube video plays inline on the page. `?t=90` starts it at 1:30.
- Reuse `Navbar`, `Breadcrumbs`, `Badge`, `Button`, the tokens, and `formatDuration`.

## Security considerations

- All reads go through the server-only `sanityFetch`. The read token never reaches the client. Client components receive only plain serializable props: strings, numbers, and a cover URL.
- The iframe `src` is built from regex-validated ids on fixed provider origins. A stored URL can't inject an arbitrary frame origin or a `javascript:` URL.
- External links (resources and note links) are restricted to `http(s):` and `mailto:`, and open with `rel="noopener noreferrer"`.
- There are no writes, no auth, and no new secrets. PostHog uses the existing public project key through the `/vx-signal` proxy.

## Acceptance criteria

- `/lessons/nextjs-app-router-in-depth-caching-and-revalidation` renders:
  - the breadcrumbs All Courses › Next.js App Router in Depth › Data Fetching and Caching › Caching and revalidation;
  - the badge `LESSON 3.2`, the title, and the summary;
  - `25m · Intermediate · 11,643 students`;
  - the YouTube embed;
  - the Overview, 3 key points, the Pro Tip, and 1 resource card;
  - Previous "Fetching data in server components" (4m) and Next "Streaming with Suspense" (3m).
- The sidebar:
  - shows `Module 3 of 4` and `0% complete`;
  - joins modules 1–2 with the timeline;
  - highlights module 3, expanded, with this lesson marked "Now playing";
  - collapses module 4 below a divider.
  - Toggling any module expands and collapses its lessons.
- The video plays inline. `?t=90` starts it at 1:30.
- The Notes tab shows the Portable Text notes (intro, heading, bullet list, and outro), and the keyboard arrows switch tabs.
- A lesson without a pro tip hides the box.
- The first lesson of a course has no Previous, and the last has no Next.
- An unknown slug returns the 404 page.
- There's no horizontal scroll at 375px, and the outline collapses on mobile.
- There are no console errors (the PostHog `lesson_viewed` event appears with the debug flag on).

## Checks to run

- `npx next typegen` (generates `PageProps` for the new route), then `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (a new route that statically generates 120 lessons)
- `npm run dev`, then load a lesson, a `?t=` URL, and a 404 slug, and capture a headless screenshot to compare against the design

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000/lessons/nextjs-app-router-in-depth-caching-and-revalidation`.
2. Compare against `design/vertex-lesson.png`: sidebar, header, video, tabs, content, and footer.
3. Press play. The video plays inside the page.
4. Open the same URL with `?t=90`. Playback starts at 1:30.
5. Click the **Notes** tab and check that the notes render. Use the Left and Right arrow keys to switch tabs.
6. In the sidebar, expand module 4 and click one of its lessons. The page loads that lesson with module 4 highlighted.
7. Click **Next Lesson** and **Previous Lesson** across a module boundary.
8. Open `/lessons/nextjs-app-router-in-depth-file-system-routing` (the first lesson) and confirm there's no Previous button.
9. Open `/lessons/does-not-exist` and confirm the 404.
10. Resize to about 375px. The outline is collapsed behind "Module X of Y", the video is full width, and nothing scrolls horizontally.
