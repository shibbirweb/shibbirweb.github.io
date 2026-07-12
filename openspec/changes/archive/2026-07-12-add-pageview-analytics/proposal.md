## Why

Google Tag Manager (`GTM-W4DC9Z6`) loads once in the root layout, but this is a Next.js App Router app where navigation between routes happens client-side without a full page load. GTM does not auto-emit anything on client route changes and nothing in the app pushes to `dataLayer` on navigation, so only the first landing page is ever recorded. Analytics effectively behaves as "single page." We want every route visit recorded, and individual article pages recorded distinctly so article engagement can be segmented in GA.

## What Changes

- Add a client-side route-change tracker that pushes a `page_view` event to the GTM `dataLayer` on initial load and on every subsequent client navigation, carrying `page_path` and `page_title`.
- On article detail routes (`/articles/<slug>`), additionally push a distinct `article_view` event carrying `article_slug` and `article_title`, so articles are measurable separately from ordinary pages.
- Mount the tracker in the root layout, gated on `process.env.NODE_ENV === 'production'`, mirroring the existing GTM render so dev stays clean.
- Document the required GTM container configuration (Data Layer Variables, Custom Event triggers, GA4 event tags) since forwarding these events to GA4 happens in the GTM UI, outside the repo.

## Capabilities

### New Capabilities
- `analytics`: Client-side page-visit and article-view event tracking that emits GTM `dataLayer` events on every App Router route change.

### Modified Capabilities
<!-- None. No existing spec's requirements change. -->

## Impact

- Static-export impact: the tracker is a client component using `usePathname`; it emits events at runtime in the browser and does not affect the static pre-render or `generateStaticParams`. No server runtime is introduced.
- New code: `src/components/analytics/PageviewTracker/` (component + `hooks/usePageviewTracking.ts`).
- Modified code: `src/app/layout.tsx` (import + prod-gated mount).
- Dependencies: reuses `sendGTMEvent` from `@next/third-parties/google` (already a dependency) and `usePathname` from `next/navigation`. No new packages.
- Out-of-repo: GTM container `GTM-W4DC9Z6` must be configured to forward the new events to GA4; documented in design.md.
