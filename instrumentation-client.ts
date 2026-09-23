import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken || !apiHost) {
  if (process.env.NODE_ENV === "development") {
    const missingVariable = !projectToken
      ? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN"
      : "NEXT_PUBLIC_POSTHOG_HOST";

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    );
  }
} else {
  posthog.init(projectToken, {
    // Proxied by the /vx-signal rewrites in next.config.ts.
    api_host: "/vx-signal",
    ui_host: apiHost.replace(".i.posthog.com", ".posthog.com"),
    defaults: "2026-05-30",
    capture_exceptions: true,
    // Opt-in: debug mode logs every event and prints expected blocker failures as errors.
    debug: process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true",
  });
}
