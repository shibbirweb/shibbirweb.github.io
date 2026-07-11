## Context

The portfolio is statically exported (`next.config.ts`: `output: 'export'` in prod) and served on GitHub Pages under `https://shibbir.me` at root. There is no runtime server, so the service worker and version endpoint must be static assets in `./out`. Dev uses turbopack; prod uses `next build` (webpack). The codebase favors minimal dependencies, hand-rolled `tsx scripts/*.ts` build steps, `@/` imports only, components only under `src/components/`, side-effect logic in named `useXxx` hooks, and prod-only gating (already used for GTM and JSON-LD in `layout.tsx`). No em dash anywhere.

A manifest already ships (`src/app/manifest.ts`); the missing pieces are the service worker, offline caching, a build-version signal, and an update flow.

## Goals / Non-Goals

**Goals:**
- Offline access to pages/articles after their first visit (runtime caching).
- A `version.json` endpoint plus a client-baked build version to detect new deploys.
- A non-blocking reload toast that applies a new build on the visitor's action.
- Zero service worker in dev; no interference with turbopack.

**Non-Goals:**
- Precaching the full article corpus for offline-from-first-load (visited-pages caching only).
- Push notifications or background sync.
- Automatic silent reload (deliberately avoided so reading is never interrupted).
- Reworking the existing manifest beyond what registration requires.

## Decisions

**SW tooling: Serwist (`@serwist/next`) over hand-rolled.** User choice. Serwist builds the worker, injects a precache manifest, provides `defaultCache` runtime strategies (CacheFirst for static assets, NetworkFirst for navigations), and disables itself in dev, which matches the prod-only gate. Alternative considered: a hand-rolled `public/sw.js` from a template script (fits the repo's script style, no dep). Retained as the fallback (see Risks).

**Registration is manual (`register: false`), driven by `@serwist/window`.** Auto-register would hide the lifecycle we need. Registering through the `@serwist/window` `Serwist` client exposes `waiting`/`controlling` events that drive the toast and the message-based `skipWaiting`. Alternative: auto-register + raw `navigator.serviceWorker` listeners; more boilerplate, less typed.

**Two update triggers.** (1) The SW lifecycle: a new deploy changes the worker bytes, the browser installs it, it goes `waiting`, the toast shows. (2) A `version.json` poll on focus/interval: on a long-lived tab this beats the browser's periodic byte-check and calls `serwist.update()` to force the check. The explicit version endpoint was requested and also decouples "new build exists" from the SW's internal timing.

**Version is a monotonically increasing build number.** `src/lib/version.ts#getBuildVersion()` returns an integer that increases on every build: the git commit count (`git rev-list --count HEAD`), which advances on each commit and therefore each deploy build, works identically locally and in CI, and needs no persisted state. Fallback when git is unavailable: a timestamp. Alternatives considered and rejected: (a) a counter file bumped per `pnpm build` resets on the fresh CI checkout unless committed back, adding a noisy commit per deploy; (b) a raw git short SHA is not ordered, so a client cannot tell newer from older. `getBuiltAt()` also returns a build timestamp for absolute ordering and display.

This value is shared so client and endpoint always agree: it feeds both `NEXT_PUBLIC_BUILD_VERSION` (baked into the client via `next.config.ts` `env`) and the force-static `src/app/version.json/route.ts` (mirrors `src/app/feed.json/route.ts`). The client detects a new deploy when the polled `version.json` `version` is greater than its own baked `NEXT_PUBLIC_BUILD_VERSION`.

**Placement.** `src/app/sw.ts` is a Serwist build entry, not a component (same class as `sitemap.ts`/route handlers), so it is allowed under `src/app/`. All UI lives in `src/components/pwa/`: `ServiceWorkerManager/` (client, thin) with `hooks/useServiceWorker.ts` (all effects), and `UpdateToast/` with a co-located `UpdateToast.module.css` (theme-aware via `prefers-color-scheme`, `motion-safe:` transitions). `layout.tsx` renders `<ServiceWorkerManager/>` behind `process.env.NODE_ENV === 'production'`.

## Risks / Trade-offs

- **Serwist may not emit into `output: 'export'` cleanly (export + turbopack friction)** -> First implementation step is a compatibility gate: run `pnpm build`, confirm `out/sw.js` is non-empty with a precache manifest. If it fails, swap to a hand-rolled `scripts/generate-sw.ts` (template, inject version into the cache name, write `public/sw.js`) with the same runtime strategies; the client, toast, and `version.json` plumbing are unchanged.
- **Stale service worker serving old assets** -> NetworkFirst for navigations plus the version poll and `waiting`-driven toast bound staleness; the toast lets the user pull the latest on demand.
- **A hard-cached SW blocking future updates** -> keep `sw.js` served without long immutable caching and rely on the browser byte-check; the version poll is the backstop.
- **No test suite** -> verification is manual: DevTools Application panel (SW activated, Cache Storage), offline reload of a visited article, and a simulated redeploy to confirm the toast and reload.

## Migration Plan

Additive only; no existing route, content, or `constants.ts` changes. Deploy via the normal `master` -> Pages workflow. Rollback: remove the `withSerwist` wrapper and the `<ServiceWorkerManager/>` render (or ship an empty/no-op `sw.js`) so existing installs unregister on next load.

## Open Questions

- None blocking. The Serwist-vs-fallback fork is resolved procedurally by the compatibility gate rather than deferred.
