## Why

The site advertises itself as a PWA (`manifest.ts` ships icons, screenshots, and `display: standalone`) but has no service worker, so nothing is cached, it is not truly installable-with-offline, and a running install has no way to learn that a newer build was deployed. Finishing the PWA gives readers offline access to pages they have visited and a one-tap path to the latest content after a deploy.

## What Changes

- Add a Serwist-generated service worker to the static export that provides runtime caching, so any page or article works offline after its first visit.
- Add a static `version.json` endpoint and bake the build version into the client, so a long-lived tab can poll and detect that a newer build exists.
- Add a non-blocking "New version available, Reload" toast: when a new build is detected (via the service worker `waiting` lifecycle or the `version.json` poll), the user taps to swap to the latest content.
- Register the service worker only in production, mirroring the existing prod-only gating for Google Tag Manager and JSON-LD, so turbopack dev is unaffected.

## Capabilities

### New Capabilities
- `pwa`: Service worker lifecycle, offline runtime caching of visited pages, a build-version endpoint, and the in-app update-available notification and reload flow.

### Modified Capabilities
<!-- None: no existing spec's requirements change. -->

## Impact

- Static export: the service worker (`sw.js`) and `version.json` must be emitted into `./out` and served from the custom-domain root. Serwist is disabled in dev so it does not fight turbopack; if Serwist cannot emit into `output: 'export'`, a hand-rolled `scripts/generate-sw.ts` is the fallback with identical client plumbing.
- Dependencies: adds `@serwist/next` and `serwist`.
- Config: `next.config.ts` wrapped with `withSerwist(...)` and a `NEXT_PUBLIC_BUILD_VERSION` env baked at build time.
- New code: `src/app/sw.ts`, `src/app/version.json/route.ts`, `src/lib/version.ts`, and `src/components/pwa/` (`ServiceWorkerManager` + hook, `UpdateToast`); `layout.tsx` renders the manager behind the production gate.
- No changes to article content, existing routes, or `src/config/constants.ts`.
