# Sanity Content Model, Standalone Studio, and Server Data Layer

## Goal
Model Vertex's core content in Sanity (course, module, lesson, instructor, category), author it in a **standalone** Studio workspace, and give the Next.js app a server-only read client plus typed GROQ data helpers that the future catalog, course, lesson, and instructor pages will call. No pages are built or changed here.

Out of scope, handled by later prompts: the video document and ingestion pipeline, the agent context document, progress records, seed content, and wiring the homepage to live data.

## Skills read
- `sanity-best-practices`, including `project-structure.md` (standalone Studio + frontend in one repo; embedded Studio is legacy), `schema.md` (defineType/defineField/defineArrayMember, icons from per-icon subpaths, references vs objects, validation), `typegen.md` (typegen config in `sanity.cli.ts`, generating into the frontend, unique query names), `nextjs.md` (migrating off an embedded Studio, fetch caching and tags, `useCdn`).
- AGENTS.md sections 5, 6, 7, 8, 12, 13.
- Next.js 16 docs: `02-guides/caching-without-cache-components.md` (fetch is uncached by default, opt in with `next.revalidate`/`tags`) and `02-guides/data-security.md` (`import 'server-only'`).

## Code inspected
- `package.json` (modified, uncommitted): adds `sanity`, `@sanity/vision`, `styled-components`, `next-sanity`, `@sanity/image-url`. The first three exist only for an embedded Studio.
- Untracked `sanity.config.ts`, `sanity.cli.ts`, `sanity/` and `app/studio/[[...tool]]/page.tsx` are the `sanity init` **embedded** Studio scaffold at `/studio`. AGENTS.md section 5 forbids embedding. `sanity/lib/client.ts` has no token and `sanity/lib/live.ts` uses `defineLive` with no token, which would fail against a private dataset.
- `.env.local` sets `NEXT_PUBLIC_SANITY_PROJECT_ID=n2c3rnrz` and `NEXT_PUBLIC_SANITY_DATASET=production`. There is no read token yet. `.env.example` lists only the Clerk keys.
- `tsconfig.json` includes `**/*.ts`, so a nested `studio/` would be type checked by the web app unless it is excluded. `eslint.config.mjs` would lint it too.
- `app/page.tsx` renders hardcoded course cards. The designs (`design/vertex-home.png`, `vertex-course.png`, `vertex-lesson.png`) show the fields the data layer has to supply: course logo/cover, level, total duration, module count, student count, popular badge, learning outcomes with icons, per-module duration, lesson summary, key points, pro tip, resources (docs, guide, repository), Lesson 5.1 numbering, and previous/next lesson.
- `server-only` is already in `node_modules` as a transitive dependency.

## Decisions and assumptions
1. **Standalone Studio at `studio/`**, its own `package.json`, run with `sanity dev` on :3333. Delete the embedded scaffold (`app/studio/`, root `sanity.config.ts`, root `sanity.cli.ts`, `sanity/`). Remove `sanity`, `@sanity/vision`, and `styled-components` from the root package. Keep `next-sanity` and `@sanity/image-url`.
2. **The Next.js app stays at the repo root** and acts as the "web" workspace. Moving it into `web/` is a larger, separate restructure and is not needed for independent deploys. Root `tsconfig.json` excludes `studio`, and ESLint ignores `studio/**`.
3. **Data layer lives in `lib/sanity/`**:
   - `env.ts` reads project id, dataset, and API version. It asserts they are set.
   - `client.ts` begins with `import 'server-only'`. It builds the client with `SANITY_API_READ_TOKEN`, `perspective: 'published'`, and `useCdn: true` (the API CDN serves authenticated requests).
   - `fetch.ts` begins with `import 'server-only'`. `sanityFetch({ query, params, tags })` calls `client.fetch` with `next: { revalidate: 60, tags }`. There is no `defineLive`/`SanityLive`, because that would need a browser token or a public dataset.
   - `queries.ts` holds every GROQ query written with `defineQuery` and uniquely named.
   - `data.ts` begins with `import 'server-only'`. It exports typed helpers: `getCourses()`, `getCourseBySlug(slug)`, `getLessonBySlug(slug)`, `getInstructorBySlug(slug)`, `getCategories()`, and slug lists for `generateStaticParams`.
   - `image.ts` exports `urlFor()`. It has no token, so it is safe anywhere.
4. **Derived values are computed, not stored.** Course duration sums its lesson durations. Module duration and module/lesson counts come from GROQ. Labels like "Module 5" and "Lesson 5.1" and previous/next lesson are derived in `data.ts` from module order.
5. **A lesson's course comes from a reverse reference**: `*[_type == "course" && ^._id in modules[].lessons[]._ref][0]`. A lesson never stores its course.
6. **Lesson duration is stored as whole minutes (`durationMinutes`).** The designs only show minutes, and minutes are easier to author than seconds. Precise second-level timing comes later from video chapters and transcript chunks.
7. **Outcome icons** are a fixed string list of lucide-react names (layers, database, gauge, cloud, code, shield, zap, rocket, book-open, terminal, server, lock). The app already uses lucide-react, so the page can map a name to its component.
8. **TypeGen** is configured in `studio/sanity.cli.ts`. It scans `../lib/**/*.ts` and `../app/**/*.{ts,tsx}` and writes `../sanity.types.ts`, which is committed. `overloadClientMethods` is on. `studio/schema.json` is git-ignored.
9. **Studio env**: `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` go in `studio/.env`, which the root `.env*` rule already git-ignores. A committed `studio/.env.example` lists them.
10. `next.config.ts` gets an `images.remotePatterns` entry for `cdn.sanity.io` so later pages can use `next/image` with `urlFor`.

## Content model

| Type | Kind | Fields |
|---|---|---|
| `category` | document | title*, slug*, description |
| `instructor` | document | name*, slug*, photo (image with hotspot and alt), expertise (string array, e.g. "Next.js"), bio (text) |
| `course` | document | title*, slug*, summary* (text, max 300), coverImage* (image with hotspot and alt), level* (beginner/intermediate/advanced, radio), price (number ≥ 0, 0 = free), popular (boolean, default false), studentCount (int ≥ 0), learningOutcomes (array of `learningOutcome`, max 6), instructor* (ref), category* (ref), modules* (array of `module`, min 1) |
| `module` | object | title*, summary, lessons* (array of refs to `lesson`, unique, min 1) |
| `learningOutcome` | object | icon* (string list above), title*, description |
| `lesson` | document | title*, slug*, summary (text, the subtitle and overview), videoUrl* (url, host must be YouTube, Vimeo, or Bunny), thumbnail (image with hotspot and alt), durationMinutes* (int ≥ 1), freePreview (boolean, default false), studentCount (int ≥ 0), notes (`blockContent`), keyPoints (string array, max 6), proTip (text), resources (array of `resource`) |
| `resource` | object | type* (documentation/guide/repository/article/download), title*, description, url* |
| `blockContent` | array | blocks (normal, h2, h3, blockquote; bullet and number lists; strong, em, code marks; link annotation) plus inline images with alt |

`*` = required. Every type gets an icon imported from `@sanity/icons/<Name>` subpaths and a preview. Slugs are generated from title or name, and Sanity's default per-type uniqueness check applies. Studio structure lists, in order: Courses, Lessons, Instructors, Categories.

## Files expected to touch
- Delete: `app/studio/`, `sanity.config.ts`, `sanity.cli.ts`, `sanity/`.
- New `studio/`: `package.json`, `tsconfig.json`, `sanity.config.ts`, `sanity.cli.ts`, `structure.ts`, `.env.example`, `.gitignore` (`schema.json`, `dist`, `.sanity`), `schemaTypes/index.ts`, `schemaTypes/documents/{course,lesson,instructor,category}.ts`, `schemaTypes/objects/{module,learning-outcome,resource,block-content}.ts`.
- New `lib/sanity/`: `env.ts`, `client.ts`, `fetch.ts`, `image.ts`, `queries.ts`, `data.ts`.
- New `sanity.types.ts` (generated).
- Edit: `package.json` and `package-lock.json` (remove the three Studio-only dependencies, add `server-only`), `tsconfig.json` (exclude `studio`), `eslint.config.mjs` (ignore `studio/**`), `next.config.ts` (images), `.env.example` (Sanity vars).

## Requirements
- Use `defineType`, `defineField`, and `defineArrayMember` everywhere. Every array member gets a `_key`, and every array projection selects `_key`.
- Queries return only the fields the designs need. There are no `...` spreads on documents. Portable Text `notes` are returned only by the lesson query.
- `getLessonBySlug` returns the lesson, its course (title, slug, coverImage, level, instructor), its module (title plus derived 1-based number), its derived lesson label (`5.1`), the full course outline (modules → lessons: title, slug, durationMinutes) for the sidebar, and the previous and next lessons.
- `getCourseBySlug` returns the marketing fields, outcomes, instructor, category, total duration, module count, and for each module its number, duration, and lessons.
- `getCourses` returns the card fields: title, slug, summary, coverImage, level, popular, total duration, module count.
- `getInstructorBySlug` returns the instructor and the courses that reference them.
- Helpers return `null` when nothing is found. Pages will call `notFound()`.

## Security considerations
- `SANITY_API_READ_TOKEN` has no `NEXT_PUBLIC_` prefix and is read only in `lib/sanity/client.ts`. `client.ts`, `fetch.ts`, and `data.ts` all import `server-only`, so importing them from a client component fails the build.
- Only the project id, dataset, and API version are public.
- The dataset should be **private** (AGENTS.md section 12). Switching visibility is a project setting, so the user runs it (see "Needs your attention" in the final report). The token must be a **Viewer** (read) token.
- The Studio holds no tokens. It authenticates with the author's Sanity login.

## Acceptance criteria
- No embedded Studio remains. The `/studio` route no longer exists in the Next.js app.
- `cd studio && npm run dev` opens a Studio on :3333 showing Courses, Lessons, Instructors, Categories. A course can be created with modules that reference lessons. Required-field and video-host validation fire.
- `sanity.types.ts` is generated, and the `lib/sanity/data.ts` helpers get typed results without manual casts.
- Importing `lib/sanity/data.ts` into a `"use client"` file breaks the build (checked by reasoning about `server-only`, not committed).
- Web type check, lint, and build pass. The Studio build passes.

## Checks to run
- Web (root): `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Studio: `npm run typegen` (schema extract + typegen generate), `npx tsc --noEmit`, `npx sanity build`.
- Studio, **after asking the user** (outward-facing, needs Sanity CLI login): `npx sanity schema deploy` and `npx sanity deploy`. The Context MCP needs a deployed Studio later.
- Live smoke test once a token exists: `npx sanity documents query '*[_type in ["course","lesson"]][0...3]{_type,title}'` from `studio/`.

## Manual test steps
1. `cd studio && npm install && cp .env.example .env`, then fill in `SANITY_STUDIO_PROJECT_ID=n2c3rnrz` and `SANITY_STUDIO_DATASET=production`.
2. `npm run dev` in `studio/`, open http://localhost:3333, and log in.
3. Create a Category, an Instructor, two Lessons (one with a YouTube URL, and try an invalid host to see the validation error), then a Course with one module referencing both lessons. Publish all of them.
4. Create a Viewer token in sanity.io/manage → API → Tokens and add `SANITY_API_READ_TOKEN=` to the root `.env.local`.
5. From the root, run `npm run dev` and confirm `/studio` now 404s and the homepage still renders.
6. (Optional) Temporarily call `getCourses()` from a server component and confirm it returns the published course with computed duration and module count.
