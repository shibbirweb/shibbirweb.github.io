## 1. Tracking hook

- [x] 1.1 Create `src/components/analytics/PageviewTracker/hooks/usePageviewTracking.ts`: read `usePathname()` from `next/navigation`; in a `useEffect` keyed on `pathname`, push `{ event: 'page_view', page_path: pathname, page_title: document.title }` via `sendGTMEvent` from `@next/third-parties/google`.
- [x] 1.2 In the same hook, detect article detail routes with `/^\/articles\/([^/]+)$/` where the captured segment is not `search`; when matched, additionally push `{ event: 'article_view', article_slug: <segment>, article_title: document.title }`.

## 2. Tracker component

- [x] 2.1 Create `src/components/analytics/PageviewTracker/index.tsx` as a `'use client'` component that calls `usePageviewTracking()` and returns `null`; import the hook via the `@/` alias.

## 3. Wire into layout

- [x] 3.1 In `src/app/layout.tsx`, import `PageviewTracker` via the `@/` alias and render `<PageviewTracker />` gated on `process.env.NODE_ENV === 'production'`, alongside the existing `GoogleTagManager` render.

## 4. Verify

- [x] 4.1 Run `pnpm lint` and `pnpm build` to confirm the static export succeeds with the new client component (no Suspense/`useSearchParams` errors). Also verified the article-detection regex against every route and confirmed `page_view` / `article_view` / `page_path` / `article_slug` ship in the compiled prod `layout` chunk.
- [ ] 4.2 Serve the `./out` export and use GTM Preview mode to confirm a single `page_view` fires on initial load, a `page_view` fires on each client route change, and an `article_view` fires only on `/articles/<slug>` (not on `/articles` or `/articles/search`), with no duplicate landing hit. (Maintainer step: needs live GTM container in the browser.)
- [ ] 4.3 Perform the GTM container configuration in the GTM UI per design.md (Data Layer Variables, Custom Event triggers, GA4 event tags), then publish. (Maintainer step: out-of-repo GTM UI.)
