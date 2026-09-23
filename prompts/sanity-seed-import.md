# Seed Sample Content Into Sanity

## Goal
Fill the `production` dataset (project from `studio/.env`) with sample content so the catalog and cross-course search have real data: 6 categories, 5 instructors, 10 courses (4 modules each), and 120 lessons across web development, AI engineering, languages, data, backend/infrastructure, and security.

Keep the relations consistent. Each lesson belongs to exactly one module of exactly one course. A module's duration and lesson count are the sums over its lessons, and a course's are the sums over its modules. Verify all of this against the live dataset after import.

Out of scope: video documents (chapters and transcript chunks come from the ingestion pipeline), the agent context document, progress records, page changes, and `sanity deploy` of the Studio app.

## Skills read
- `sanity-migration`: a transform step before import, stable `_id`s so re-runs are idempotent, `_key`s on array items, `_sanityAsset` for images, and verifying counts and references after the load.
- `sanity-best-practices`: schema lists, TypeGen, and the private dataset rules.
- AGENTS.md sections 5, 7, 8, 12, 13.

## Code and data inspected
- The dataset is empty. A query for non-system documents returns `[]`.
- `studio/schemaTypes/scripts/seed/seed.ndjson` (untracked, already in the repo): 141 documents with stable ids. It contains `category` 6, `instructor` 5, `course` 10, and `lesson` 120. Every course has 4 modules of 3 lessons. All 120 lessons are referenced exactly once, and every reference resolves. Each lesson has its own real YouTube video, and all 120 video URLs are unique. There are 10 free previews. No lesson's student count is higher than its course's.
- `studio/schemaTypes/scripts/seed/videos.json`: YouTube metadata keyed by lesson slug. Every lesson's `duration` (in seconds) equals the real video length recorded there. It is input for the future ingestion pipeline and is not imported.
- Schema: `studio/schemaTypes/**`. Queries: `lib/sanity/queries.ts`. The queries already derive module and course durations as `math::sum(...->durationMinutes)` and counts as `count(...)`, and nothing stores a total. So consistency holds by construction as long as every lesson has a valid `durationMinutes`.
- The seed does not match the schema in five places:
  | Seed | Schema |
  |---|---|
  | `lesson.duration` in seconds | `durationMinutes`, required, integer, at least 1 |
  | lessons have no `summary` | optional `summary`, at most 400 characters |
  | `resource.type: "link"` on all 122 resources | documentation, guide, repository, article, download |
  | outcome icons `workflow`, `sparkles`, `puzzle` | not in `OUTCOME_ICONS` |
  | `instructor.bio` is Portable Text | `text` |

## Decisions
1. **Reuse the existing seed and do not write new content.** It already meets the request: more than 10 related courses, coherent modules, and real videos whose lengths match. The source files stay byte-for-byte unchanged.
2. **Add a transform script, `studio/scripts/prepare-seed.mjs`** (plain Node, no dependencies). It reads `seed.ndjson`, fixes the mismatches, validates the result, and writes `studio/.seed/seed.ndjson`, which is git-ignored. It fixes the mismatches as follows:
   - `durationMinutes = max(1, round(duration / 60))`, and it drops `duration`. Minutes are what the designs show. Module and course totals are sums of these same integers, so the totals always add up.
   - `summary` is the lesson's first notes paragraph, which is authored text of 93 to 181 characters.
   - Resource type: `aws.amazon.com` and `owasp.org` become `guide`, and every other resource becomes `documentation`. All of them are official documentation sites.
   - `bio` becomes plain text, with paragraphs joined by a blank line.
3. **Schema change: add `workflow`, `sparkles`, and `puzzle` to `OUTCOME_ICONS`** in `studio/schemaTypes/objects/learning-outcome.ts`. These are valid lucide-react names, so the authored icons are kept instead of being swapped for different ones. Then regenerate `sanity.types.ts` with `npm run typegen` and run `sanity schema deploy`.
4. **The script fails loudly and writes nothing if any check fails.** It checks that:
   - every reference resolves;
   - each lesson is referenced by exactly one course module;
   - `_id`s are unique, and `_key`s are unique within each array;
   - required fields are present (course title, slug, summary of at most 300 characters, cover, level, instructor, category, at least one module; lesson title, slug, videoUrl, and durationMinutes of at least 1);
   - each course has at most 6 outcomes and each lesson at most 6 key points;
   - outcome icons and resource types are in the schema lists.
5. **npm scripts in `studio/package.json`:**
   - `seed:prepare` runs `node scripts/prepare-seed.mjs`.
   - `seed:import` runs `seed:prepare` first and imports only if preparation succeeds. It then runs `node scripts/import-seed.mjs`. The wrapper reads `SANITY_STUDIO_DATASET` from `studio/.env` and runs `sanity dataset import .seed/seed.ndjson --dataset <it> --replace`. It exists because, during implementation, `sanity dataset import` did not take the dataset from `sanity.cli.ts`. `--replace` makes re-runs idempotent.
6. Images use `_sanityAsset` URLs: i.ytimg.com for thumbnails (each video's own frame), randomuser.me for instructor photos, and picsum.photos seeded by slug for course covers. The user confirmed these sources. The import uploads them as Sanity assets. Do not pass `--allow-failing-assets`, so a host failure is reported instead of hidden.
7. Videos: every lesson keeps its own unique, topic-matched YouTube URL from the seed. The user confirmed this.

## Files touched
- `studio/scripts/prepare-seed.mjs` (new)
- `studio/scripts/import-seed.mjs` (new)
- `studio/package.json` (two scripts)
- `studio/.gitignore` (`.seed`)
- `studio/schemaTypes/objects/learning-outcome.ts` (3 icons)
- `sanity.types.ts` (regenerated)
- This prompt

## Security considerations
- The import uses the CLI's logged-in session. No token is written, printed, or added to env.
- The dataset stays private. No web or client code changes.

## Checks
1. `cd studio && npm run seed:prepare`. Expect printed counts of 6, 5, 10, and 120, and all validations passing.
2. `npm run typegen`, then `npx sanity schema deploy`.
3. `npm run seed:import`.
4. Live GROQ checks through `npx sanity documents query`:
   - The counts per type are 6, 5, 10, and 120.
   - `count(*[_type=="lesson" && count(*[_type=="course" && references(^._id)]) != 1])` is `0`, so there are no orphan or shared lessons.
   - Every course's `math::sum(modules[].lessons[]->durationMinutes)` equals the sum of its per-module sums, and `count(modules[].lessons[])` equals the sum of its per-module counts. The mismatch count is `0`.
   - No lesson has an undefined `durationMinutes`, and no course has an unresolved instructor or category.
   - Image assets exist.
5. In the root workspace: `npx tsc --noEmit` and `npm run lint`. Only `sanity.types.ts` changes there.
6. `git diff --stat -- studio/schemaTypes/scripts/seed` is empty, and the source files are unchanged.

## Acceptance criteria
- The dataset holds 6 categories, 5 instructors, 10 courses, and 120 lessons, all with images.
- Every lesson belongs to exactly one course and module. Module totals sum to course totals for both duration and lesson count.
- The seeded documents pass Studio validation. That means no duration, resource type, icon, or bio errors.
- Re-running `seed:prepare` and `seed:import` produces the same dataset, with no duplicates.

## Manual test
1. `cd studio && npm run dev`, then open http://localhost:3333.
2. Courses shows 10 entries. Open "Next.js App Router in Depth": it has 4 modules, each with 3 lessons, a cover image, and 4 outcomes with icons and no validation warnings.
3. Lessons shows 120 entries, each with a YouTube thumbnail and a subtitle like "6 min".
4. Instructors shows 5 entries with photos and plain-text bios.
5. In Vision, run `*[_type=="course"]{title, "min": math::sum(modules[].lessons[]->durationMinutes), "modules": modules[]{title, "min": math::sum(lessons[]->durationMinutes)}}` and confirm that each course's minutes equal the sum of its modules' minutes.
