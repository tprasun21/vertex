# Implementation prompt: PostHog reverse proxy, then ship the PostHog integration

> Follow-up: the proxy path was later renamed from `/ingest` to `/vx-signal` (see `posthog-dev-console-errors.md`).

## Goal

1. Fix the dev console errors: `[PostHog.js] [Dead Clicks] "failed to load script"` and `[SessionRecording] "could not load recorder"`.
2. Commit, push, and merge the PostHog integration already in the working tree into `main`.

## Skills and docs read

- `.claude/skills/integration-nextjs-app-router` (`references/EXAMPLE.md` and `next-js.md`): the recommended setup is a Next.js reverse proxy, meaning `rewrites` from `/ingest/*` to PostHog, with `api_host: "/ingest"`, a `ui_host`, and `skipTrailingSlashRedirect: true`. With it, lazy-loaded bundles and events are first-party.
- AGENTS.md sections 5, 7, and 12: the PostHog project key is public, `.env.example` is the canonical env list, and specifics come from config, not hardcoding.

## Diagnosis

- `instrumentation-client.ts` inits with `api_host = NEXT_PUBLIC_POSTHOG_HOST` (`https://us.i.posthog.com`). Session replay and dead-clicks are lazy-loaded from `https://us-assets.i.posthog.com/static/{recorder,dead-clicks-autocapture}.js`.
- Both URLs return **200** from this machine, and there's no CSP in `next.config.ts` or `proxy.ts`. So the scripts exist, and the browser is refusing the third-party `*.posthog.com` requests. That's typical of an ad or tracking blocker (uBlock, Brave Shields, and so on). The same blocker would also drop events silently.
- The fix is a first-party reverse proxy, so the browser only talks to our own origin.

## Decisions

1. **`next.config.ts`:**
   - Add `rewrites()`:
     - `/ingest/static/:path*` → the assets host `/static/:path*`
     - `/ingest/array/:path*` → the assets host `/array/:path*`
     - `/ingest/:path*` → the ingestion host
   - Add `skipTrailingSlashRedirect: true`.
   - The ingestion host is read from `NEXT_PUBLIC_POSTHOG_HOST`, with `https://us.i.posthog.com` as the default. The assets host is derived from it (`us.i.posthog.com` → `us-assets.i.posthog.com`), so an EU project works by changing the env var only.
2. **`instrumentation-client.ts`:**
   - `api_host: "/ingest"`
   - `ui_host` derived from the same env var (`us.i.posthog.com` → `https://us.posthog.com`), so toolbar and replay links still open PostHog
   - The existing missing-env check is kept.
3. **`.env.example`:** add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=` and `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` under a PostHog section. Both are public by design, and no private PostHog key is used.
4. **`.gitignore`:** drop the added `.env.local` line. It's redundant because `.env*` already ignores it.
5. **Ship as-is:** everything else in the tree goes into the commit unchanged (user decision):
   - the `posthog-js` dependency
   - `PostHogIdentity`, which identifies Clerk users with email and name
   - the capture calls in `CourseGrid`, `CourseContent`, and `CourseProgressBar`
   - the 4 PostHog `.claude/skills` folders
   - `posthog-self-driving-report.md`
6. **Branch and PR:** create `feature/posthog-analytics` from the current HEAD, which is already in `main`. Open a PR to `main` and merge it with a merge commit, matching earlier PRs.

## Files to touch

- `next.config.ts`
- `instrumentation-client.ts`
- `.env.example`
- `.gitignore`
- Commit the existing PostHog files listed above

## Security considerations

- Only public values: the PostHog project token and host. No secrets are added, and `.env.local` stays ignored.
- The proxy forwards only to PostHog hosts. The paths are fixed, not user-controlled destinations.
- `PostHogIdentity` sends each signed-in user's email and name to PostHog. This is kept per the user's decision and noted in the PR.

## Acceptance criteria

- In dev, the two console errors no longer appear, including with an ad blocker on.
- Network requests go to `/ingest/...` on localhost.
- `curl localhost/ingest/static/recorder.js` returns 200 JavaScript.
- Type check, lint, and build pass.
- The PR is merged into `main`.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `next start`, then curl `/ingest/static/recorder.js`, `/ingest/static/dead-clicks-autocapture.js`, and `/ingest/flags/?v=2`

## Manual test steps

1. Run `npm run dev` and open `/` with your usual ad blocker on.
2. Confirm there are no `[PostHog.js]` "failed to load" console errors, and that the Network tab shows `/ingest/static/recorder.js` with status 200.
3. Click a course card, then check Live events in PostHog for `course_selected`.
