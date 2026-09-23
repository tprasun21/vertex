# Add Clerk Authentication

## Goal
Wire up Clerk authentication into the Vertex Next.js app so there's a working sign-in/sign-up/sign-out flow, following AGENTS.md's rule that auth is Clerk, wired through Next.js middleware, with the secret key server-only and only the publishable key reaching the browser. This is infrastructure only — no page or route is marked private yet, since My Learning, progress, and other gated features haven't been built (AGENTS.md section 7 explicitly lists My Learning as presentational-only for now). Browsing stays fully public.

## Skills read
- `clerk` (routed to `clerk-setup`) — official Clerk CLI quickstart flow for adding auth to an existing project.
- AGENTS.md sections 2 (workflow), 5 (auth boundary: Clerk via middleware, secret key server-only), 7 (auth is Clerk, gate only what's marked private, keep browsing public), 12 (Clerk secret key server-only, only publishable key to browser, protect routes in middleware not client code), 13 (checks to run).

## Code inspected
- `package.json` — plain Next.js 16 app (React 19, Tailwind 4), no Clerk deps yet, no `web`/`studio` workspace split yet (single app at repo root; that split is future work, out of scope here).
- `app/layout.tsx` — root layout, `<body>` wraps `{children}` directly, uses Playfair Display + Inter fonts.
- `app/page.tsx` — renders `<Navbar />` with no props.
- `components/ui/Navbar.tsx` — already has a right-side slot with a presentational bell icon and an empty avatar circle (`user?: { avatarUrl?: string }` prop, currently unused by the caller). This is the natural home for Clerk's sign-in/sign-up/UserButton controls.
- No `middleware.ts` or `proxy.ts` exists yet.
- No `.env` / `.env.local` / `.env.example` exists at the project root yet.
- Clerk CLI is not installed (`clerk` not found on PATH).
- No `components.json`, so no shadcn/`@clerk/ui` theming step applies.

## Decisions and assumptions
- Treat this as an **existing project** for `clerk init` (not an empty-directory scaffold) — it detects Next.js + npm and wires the SDK, provider, middleware, and env automatically.
- Always pass `--app app_3Jgdg1v51AU61Emy11yXJRs6EpT` to link the correct Clerk application, per the skill's fixed app id.
- Add `ClerkProvider` inside `<body>` in `app/layout.tsx` (not wrapping `<html>`), per the skill's critical rules.
- Extend the existing `Navbar` right-side slot rather than adding new UI: replace the static bell + empty avatar circle with Clerk's `Show`/`SignInButton`/`SignUpButton` (signed-out) and `UserButton` (signed-in), keeping the bell icon as-is since it's presentational-only per AGENTS.md section 7.
- No route is protected in this pass. `proxy.ts`/`middleware.ts` will exist (created by `clerk init`) but won't gate any paths yet, since nothing is marked private in AGENTS.md yet. This keeps browsing public per section 7.
- Verify the Next.js matcher includes `'/__clerk/:path*'` after `'/(api|trpc)(.*)'` once `clerk init` finishes.
- `clerk init` will write `.env.local` (git-ignored) with real keys. In addition, create a committed `.env.example` listing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` with placeholder values, per AGENTS.md section 12 ("keep a committed `.env.example` as the canonical list").
- Skip the `@clerk/ui`/shadcn theming step (no `components.json` in this repo).
- Install the Clerk CLI via npm (project's package manager) if not already present, per the skill's default.

## Files expected to touch
- `package.json` / `package-lock.json` — new `@clerk/nextjs` dependency (via `clerk init`).
- `proxy.ts` (or `middleware.ts`, whichever `clerk init` generates for Next.js 16) — new, unprotected matcher config.
- `app/layout.tsx` — wrap children in `ClerkProvider`.
- `components/ui/Navbar.tsx` — swap the placeholder bell/avatar slot for Clerk auth controls.
- `.env.local` — created by the CLI, not committed (already git-ignored).
- `.env.example` — new, committed, placeholder keys only.

## Requirements
- `@clerk/nextjs` only (not `@clerk/clerk-react`).
- `auth()` calls (if any server code needs them later) must be awaited — Next.js 15+/16 semantics.
- `CLERK_SECRET_KEY` never referenced from a client component or exposed to the browser.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is the only Clerk key read client-side.
- Navbar auth controls must render correctly at both desktop and mobile widths, consistent with the rest of the site being responsive.

## Security considerations
- Secret key stays server-only (env var without `NEXT_PUBLIC_` prefix, never imported into a `"use client"` file).
- `.env.local` stays git-ignored; only `.env.example` (placeholders) is committed.
- No route protection logic added to client components — middleware is the only gate, and today it gates nothing.

## Acceptance criteria
- `@clerk/nextjs` installed, Clerk CLI linked to app `app_3Jgdg1v51AU61Emy11yXJRs6EpT`.
- `ClerkProvider` wraps the app inside `<body>`.
- Middleware/proxy file exists with the correct matcher (including `/__clerk/:path*`) but protects no routes.
- Navbar shows `SignInButton`/`SignUpButton` when signed out and `UserButton` when signed in, in the existing right-side slot.
- `clerk doctor` reports no issues.
- `.env.example` committed with placeholder Clerk keys; `.env.local` untouched by git.

## Checks to run
- `npm run lint`
- `npx tsc --noEmit` (type check)
- `npm run build` (routes/config/server code changing: layout, middleware, Navbar)
- `clerk doctor`

## Manual test steps
1. Run `npm run dev` and open the homepage.
2. Confirm the navbar shows Sign in / Sign up controls in the top-right slot (replacing the old placeholder avatar).
3. Click Sign up, complete Clerk's hosted/embedded sign-up flow, create a first test account.
4. Confirm the navbar now shows the Clerk `UserButton` with the account avatar/menu.
5. Click the `UserButton`, confirm sign-out works and the navbar reverts to Sign in / Sign up.
6. Confirm no other page changed behavior (catalog/course/lesson pages still don't exist yet — just the homepage).
