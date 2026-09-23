# Implementation prompt: PostHog dev console errors (JSON parse, script loads)

## Goal

Stop the dev-time errors the user sees in Firefox:
- `Runtime SyntaxError: Unexpected end of JSON input at JSON.parse`
- repeated `[PostHog.js] … failed to load script` / `could not load recorder`

## What I checked

- **The same dev server works in a clean browser.** I loaded `http://localhost:3000/courses/postgresql-for-developers` (the user's running `next dev`) in headless Chromium with no extensions. The result: **zero errors**. Dead Clicks started, and Surveys and Conversations "loaded successfully". The dev log shows no JSON error for that visit.
- **The proxy works.** Through `localhost:3000/ingest`:
  - `static/recorder.js`, the versioned `static/1.434.11/recorder.js`, `dead-clicks-autocapture.js`, and `exception-autocapture.js` all return 200 JS.
  - `flags` returns 200 JSON.
  - A gzip event POST returns `{"status":"Ok"}`.
- **The user's Firefox fails in a way that looks like a blocker.** In `.next/dev/logs/next-development.log` (Firefox 156), **every** lazy PostHog bundle fails with a bare script error event: recorder, dead clicks, exception autocapture, surveys, and conversations. There's also a JSON parse error whose only stack frame is an anonymous `JSON.parse`, with no app or PostHog frame. That pattern matches a content blocker (uBlock Origin, AdGuard, Privacy Badger, or Firefox Strict tracking protection). Such blockers match PostHog **file paths** such as `/ingest/…`, `recorder.js`, and `surveys.js`, not only the `posthog.com` domain. PostHog's proxy docs say to avoid obvious proxy paths because "Blockers will catch them".
- **PostHog prints these errors only in debug mode.** The logger's `error` level prints only when `debug` is on. `instrumentation-client.ts` sets `debug: true` in development, which also floods the terminal (Next forwards every browser log).

## Decisions

1. **Rename the proxy path from `/ingest` to a non-obvious, app-specific path, `/vx-signal`.** This happens in the `next.config.ts` rewrites and in `api_host`, following PostHog's guidance. Blockers that match `/ingest` stop matching. Blockers that match bundle filenames can still block replay and surveys, and no client-side code can prevent that.
2. **Make PostHog debug opt-in:** `debug: process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true"`, documented in `.env.example`. By default, dev no longer turns expected blocker failures into console errors, and the terminal stops being flooded. Real integration issues can still be seen by setting the flag.
3. **No change to what gets captured, and no workaround for the user's blocker.** If a learner's blocker drops replay, that's their choice.
4. **Commit onto the open PR #7 branch** (`feature/posthog-analytics`). This doesn't merge it.

## Files to touch

- `next.config.ts`: rewrite sources.
- `instrumentation-client.ts`: `api_host` and `debug`.
- `.env.example`: `NEXT_PUBLIC_POSTHOG_DEBUG=false`.
- `prompts/posthog-proxy-and-merge.md`: note the path rename.

## Security considerations

None new. The change touches only public config and the same fixed PostHog destinations.

## Acceptance criteria

- `/vx-signal/static/recorder.js`, `/vx-signal/flags/?v=2`, and a gzip event POST all return 200 through `next start`.
- `/ingest/*` returns 404.
- Headless Chromium shows no PostHog errors, and the Network tab uses `/vx-signal`.
- Type check, lint, and build pass.

## Manual test steps

1. Restart `npm run dev`, because `next.config.ts` changed.
2. In Firefox, open `/`:
   - With the blocker on, the `[PostHog.js]` console errors should be gone. Events still reach PostHog if the blocker isn't matching the new path.
   - In a private window with extensions disabled, the Network tab should show `/vx-signal/static/recorder.js` with status 200.
3. Set `NEXT_PUBLIC_POSTHOG_DEBUG=true` and restart to see PostHog's debug logs again.
