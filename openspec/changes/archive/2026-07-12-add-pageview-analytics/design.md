## Context

GTM (`GTM-W4DC9Z6`) is injected once in `src/app/layout.tsx` via `@next/third-parties/google`'s `GoogleTagManager`, prod-gated. This app uses the App Router, so navigations between `/`, `/now`, `/uses`, `/resume`, `/articles`, `/articles/[slug]`, and `/articles/search` are client-side transitions with no full page load. The GTM snippet does not itself send GA4 hits, and nothing in the app pushes to `dataLayer` on navigation, so only the initial landing is measured. Articles are real dynamic routes rendered from local Markdown (`src/app/articles/[slug]/page.tsx`, `dynamicParams = false`, `generateStaticParams`), so they benefit from distinct tracking.

Constraints: static export (no server runtime), imports via the `@/` alias, components live under `src/components/` grouped by purpose, side effects belong in named `useXxx` hooks colocated in a `hooks/` folder, never use the em dash character.

## Goals / Non-Goals

**Goals:**
- Emit a `page_view` `dataLayer` event on initial load and on every client route change, with `page_path` and `page_title`.
- Emit a distinct `article_view` event on `/articles/<slug>` detail routes, with `article_slug` and `article_title`.
- Keep production gating identical to the existing GTM render; no analytics in dev.
- Document the GTM container setup that forwards these events to GA4 without double counting.

**Non-Goals:**
- No changes to the GTM container from code (container config is done in the GTM UI).
- No new analytics vendor, no direct `gtag.js`, no GA4 measurement ID in the repo.
- No tracking of query-string changes or in-page hash/section changes (path-level only).
- No consent-banner / cookie-consent work (out of scope for this change).

## Decisions

**Client tracker component + hook.** Add `src/components/analytics/PageviewTracker/index.tsx`, a `'use client'` component that calls `usePageviewTracking()` and returns `null`. Side-effecting logic lives in `src/components/analytics/PageviewTracker/hooks/usePageviewTracking.ts`. Rationale: matches the project rule that effects live in named hooks and components read top-down; a new `analytics/` group is purpose-based, consistent with the group-by-purpose convention. Alternative considered: inline the effect in `layout.tsx`, rejected because `layout.tsx` is a server component and holds routing/metadata concerns, not client effects.

**Track by `usePathname` only, not `useSearchParams`.** The hook depends on `usePathname()` from `next/navigation`. Rationale: `useSearchParams` in a statically exported app forces a Suspense boundary and adds complexity; path granularity is sufficient for page-visit tracking. Trade-off: query-param-only changes are not tracked (acceptable, none of the routes rely on that for a "visit").

**Emit via `sendGTMEvent`.** Use `sendGTMEvent` from `@next/third-parties/google` (already a dependency) to push events. It initializes/queues on `window.dataLayer`, so pushes made before the GTM script finishes loading are preserved. Alternative considered: manual `window.dataLayer.push`, rejected to avoid duplicating the library's initialization and typing.

**Fire on mount + on pathname change.** A single `useEffect` keyed on `pathname` fires once on mount (covering the initial landing `page_view`) and again on each change. `page_title` is read from `document.title` inside the effect so the freshly-navigated title is used. Article detection uses the regex `/^\/articles\/([^/]+)$/`; when it matches and the captured segment is not `search`, an `article_view` event is pushed in addition to `page_view`, with `article_slug` = the segment.

**Prod gating in the layout.** `<PageviewTracker />` is rendered in `src/app/layout.tsx` wrapped in `process.env.NODE_ENV === 'production'`, mirroring the existing `GoogleTagManager` render. Rationale: no GTM exists in dev to receive events, and this keeps a single, consistent gate.

## GTM container configuration (done in the GTM UI, not the repo)

Repo code only pushes `dataLayer` events. To turn them into GA4 hits, configure container `GTM-W4DC9Z6`:

1. **Data Layer Variables:** create `page_path`, `page_title`, `article_slug`, `article_title` (Variable type: Data Layer Variable, matching the pushed keys).
2. **Triggers:** create two Custom Event triggers, one firing on event name `page_view`, one on `article_view`.
3. **GA4 Configuration:** create or confirm a GA4 Configuration tag with the GA4 Measurement ID.
4. **GA4 event tag `page_view`:** event name `page_view`, event parameters mapped from `page_path` / `page_title`, firing on the `page_view` Custom Event trigger.
5. **GA4 event tag `article_view`:** event name `article_view`, parameters from `article_slug` / `article_title`, firing on the `article_view` trigger.
6. **Avoid duplicate landing hit:** do not attach a GA4 page-view tag to GTM's built-in Page View trigger; rely solely on the custom `page_view` event so the landing route is counted once.
7. **Verify + publish:** use GTM Preview to confirm both events fire, then publish the container.

## Risks / Trade-offs

- [Double counting the landing page if a GA4 tag also fires on GTM's built-in Page View trigger] → Documented step 6: forward only the custom `page_view` event to GA4.
- [`document.title` may lag one render on client navigation, so an event could carry the previous title] → Reading `document.title` inside the pathname-keyed effect captures the value after the metadata update in practice; acceptable for analytics granularity. If it proves flaky, a follow-up can pass the title explicitly.
- [Reserved article segments beyond `search` added later would be miscounted as `article_view`] → The check excludes `search` explicitly; any future reserved segment under `/articles/` must be added to the exclusion.
- [No consent gating] → Out of scope; the existing GTM already loads unconditionally in production, so this change does not alter the consent posture.

## Migration Plan

- Additive change; no data migration. Deploy via the normal `master` -> GitHub Pages flow.
- Rollback: remove the `<PageviewTracker />` mount (or the component); GTM reverts to landing-only behavior. GTM-side tags can be paused independently in the container.
