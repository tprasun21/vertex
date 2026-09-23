# PostHog Self-driving setup report

## Summary

PostHog Self-driving has been configured for this web learning platform. Session Replay, Error Tracking, and Support are enabled; health, error, and support signal sources are enabled; and a focused scout troop plus two Replay Vision monitors are active.

Findings will begin appearing in the [Self-driving inbox](https://us.posthog.com/project/622546/inbox) within about 30 minutes as new activity arrives.

## AI data processing

Approved by the setup gate.

## GitHub

The PostHog GitHub App was already connected before this setup started.

## Products enabled

| Product | Result | App check |
|---|---|---|
| Session Replay | Enabled | Web SDK initialization does not disable recording. |
| Error Tracking | Enabled | Web SDK initialization explicitly enables exception capture. |
| Support | Enabled | Tickets will begin arriving only after an inbound Support channel is connected. |

## Signal sources

| Signal source | Action |
|---|---|
| `health_checks` / `health_issue` | Enabled. |
| `error_tracking` / `issue_created` | Enabled. |
| `error_tracking` / `issue_reopened` | Enabled. |
| `error_tracking` / `issue_spiking` | Enabled. |
| `conversations` / `ticket` | Enabled. It stays idle until an inbound Support channel is connected. |
| `signals_scout` / `cross_source_issue` | On by default; no opt-out row was created. |
| `session_replay` / `session_analysis_cluster` | Deliberately skipped; Replay Vision scanners provide the supported replay route. |
| `replay_vision` | Deliberately skipped; each scanner self-authorizes through `emits_signals: true`. |

## Connected tools

No external issue-tracker, support, security, feedback, or search tool was selected in this setup. No connected-tool responders were added.

## Scout troop

**Run budget:** 100 runs/day; 0 used at setup time; 100 remaining. The early-access banner notes that additional run capacity can be requested from the PostHog Self-driving team.

**Enabled (6):**

| Scout | What it watches |
|---|---|
| General | Cross-product patterns and otherwise-unassigned surfaces. |
| Product analytics | Engagement-flow and behavioral changes. |
| Web analytics | Traffic, acquisition, and landing-page health. |
| Observability gaps | Important activity without analytical coverage. |
| Course discovery-to-lesson journey | Learning-flow handoff regressions. |
| Course-content engagement | Curriculum-navigation and content-engagement friction. |

**Disabled (23):** the remaining built-in scouts were kept off to maintain a selective troop. Error Tracking is covered by its native source, and Session Replay is covered by the Replay Vision scanners. Other disabled specialists have no current evidence of active use in this project and can be enabled later from the inbox if the relevant surface is adopted.

## Custom scouts

| Scout | Watches | Discriminator | Why it is custom |
|---|---|---|---|
| `signals-scout-course-discovery-journey` | The handoff from choosing a course to opening a lesson. | A sustained decline in lesson selections per course selection, checked by course and normalized for traffic. | The built-in product analytics scout watches generic saved flows; this scout encodes the platform’s specific course-to-lesson journey. |
| `signals-scout-course-content-engagement` | Course-outline exploration and downstream lesson selection. | A sustained increase in module exploration without a matching lesson-selection rate, segmented by course/module. | This is a product-specific curriculum-navigation behavior not owned by a native source or enabled built-in specialist. |

Both proposals were approved and created with daily default scheduling and inbox emission enabled. If either proves noisy, set its scout config’s `emit` field to `false` in PostHog to retain dry-run evidence without inbox findings.

Surfaces ruled out: error patterns are routed through native Error Tracking; replay friction is routed through Replay Vision; revenue, surveys, feature flags, experiments, logs, AI observability, CSP, and external tools lacked current project evidence.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes clear defects it finds to the inbox. These are the only configuration in this setup that consumes Replay Vision quota. Findings arrive at half weight and need independent corroboration before promotion into an inbox report.

| Scanner | Status | Query scope | Sampling | Estimate |
|---|---|---|---:|---:|
| Course browsing breakage | Created | Recordings whose current URL contains `/courses`; this covers the catalog and course-detail path where learners choose content. | 50% | 0 observations / 0 credits per month from the current seven-day sample. |
| Learning journey frustration | Created | Recordings with a `$rageclick` event only, with no URL filter. | 100% | 0 observations / 0 credits per month from the current seven-day sample. |

No recordings were present during setup. Both scanners are armed, emit to the inbox, and begin working automatically when recordings arrive. The organization has 2,500 remaining Replay Vision credits in the current period, with no projected scanner spend at setup time.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so enabled support-ticket findings can begin arriving.
- [ ] Generate real browser traffic and recordings; the scanners and custom scouts currently have no historical activity to evaluate.
- [ ] Optionally reconnect the PostHog MCP with property-definition read scope to validate the server-side event taxonomy used by the custom scouts.
- [ ] Rate early scanner observations in the Replay Vision UI; ratings produce configuration recommendations for review.

## What happens next

Fresh scout configurations are picked up by the coordinator within about 30 minutes and use the daily run budget. Self-driving groups corroborated findings into reports in the inbox; immediately actionable reports can begin coding tasks.
