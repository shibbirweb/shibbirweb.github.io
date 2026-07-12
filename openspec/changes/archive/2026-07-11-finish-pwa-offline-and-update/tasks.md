## 1. Compatibility gate (do first)

- [x] 1.1 Add deps: `pnpm add @serwist/next` and `pnpm add -D serwist`
- [x] 1.2 Wrap `next.config.ts` with `withSerwist({ swSrc: 'src/app/sw.ts', swDest: 'public/sw.js', disable: isDev, register: false, reloadOnOnline: false })`, keeping the existing `isDev ? undefined : 'export'` output logic
- [x] 1.3 Create a minimal `src/app/sw.ts` (Serwist worker using `defaultCache`) so the build has an entry
- [x] 1.4 Run `pnpm build`; confirm `out/sw.js` exists, is non-empty, and includes a precache manifest. Result: Next 16 defaults `next build` to Turbopack, which cannot run Serwist's webpack plugin; fixed by switching the `build` script to `next build --webpack` (no hand-rolled fallback needed). `out/sw.js` is 56KB with the precache manifest. Also gitignored the generated `public/sw.js`(.map)

## 2. Version source and endpoint

- [x] 2.1 Add `src/lib/version.ts` with `getBuildVersion()` returning a monotonic integer (git commit count via `git rev-list --count HEAD`, timestamp fallback when git is unavailable) and `getBuiltAt()`. (Git logic lives in `next.config.ts`; `version.ts` is the typed accessor over the baked env vars.)
- [x] 2.2 Bake `NEXT_PUBLIC_BUILD_VERSION` (and `NEXT_PUBLIC_BUILD_TIME`) into the client via `next.config.ts` `env`
- [x] 2.3 Add `src/app/version.json/route.ts` (`export const dynamic = 'force-static'`, mirrors `feed.json/route.ts`) returning `{ version, builtAt }`
- [x] 2.4 `pnpm build`; `out/version.json` emitted as `{"version":312,...}` matching the commit count baked into the client

## 3. Service worker behavior

- [x] 3.1 Finalize `src/app/sw.ts`: `defaultCache` runtime strategies (CacheFirst assets, NetworkFirst navigations), `self.__SW_MANIFEST` precache, message-driven `skipWaiting` (Serwist core handles `{type:'SKIP_WAITING'}` when `skipWaiting:false`)
- [x] 3.2 Add a single offline fallback document (`src/app/~offline/page.tsx` + `OfflineNotice` component) wired via Serwist `fallbacks` for unvisited document navigations while offline

## 4. Client: registration, update detection, toast

- [x] 4.1 Add `src/components/pwa/ServiceWorkerManager/hooks/useServiceWorker.ts`: register via `@serwist/window`, expose `updateReady` and `applyUpdate()`, and poll `version.json` (on visibility + interval, `no-store`) calling `serwist.update()` when its `version` is greater than `NEXT_PUBLIC_BUILD_VERSION`
- [x] 4.2 Add `src/components/pwa/ServiceWorkerManager/index.tsx` (thin client component: call the hook, manage dismiss, render the toast)
- [x] 4.3 Add `src/components/pwa/UpdateToast/index.tsx` + `UpdateToast.module.css`: non-blocking themed toast, "New version available" + Reload, theme-aware (background/foreground tokens flip with the theme), `motion-safe:` entrance
- [x] 4.4 Render `<ServiceWorkerManager/>` in `src/app/layout.tsx` behind `process.env.NODE_ENV === 'production'` (same gate as `JsonLdScript`)

## 5. Verification

- [x] 5.1 `pnpm build` emits `out/sw.js` (54KB, precache manifest present) and `out/version.json` (`{"version":312,...}`); static serve confirms `/sw.js` (200 text/javascript), `/version.json` (JSON), `/manifest.webmanifest` (200), `/~offline` (renders the OfflineNotice copy)
- [x] 5.4 `pnpm lint` clean (generated `public/sw.js` ignored); `pnpm dev` boots (Ready in ~1.2s), serves home 200, and registers no service worker (ServiceWorkerManager is prod-gated, Serwist `disable: isDev`)
- [x] 5.2 Verified in a real browser (puppeteer-core CDP-connected to the system chromium; true offline via stopping the static server): SW registers + activates, cache populates on navigation, a visited article renders offline from cache, and an unvisited never-linked route serves the `offline.html` fallback ("You are offline"). Found and fixed a real bug here: precaching `/offline.html` explicitly duplicated the entry `@serwist/next` already injects (`add-to-cache-list-conflicting-entries`), which made the whole SW fail to evaluate; the manual precache entry was removed
- [x] 5.3 Verified in a real browser: no toast on first load; after a simulated redeploy (bump `version.json` + change `sw.js` bytes) and `registration.update()`, the "New version available" toast appears backed by a real `waiting` worker, and clicking Reload activates it (`controllerchange` fires, page reloads)
- [ ] 5.5 OPTIONAL: Lighthouse PWA audit (installable + has-service-worker + offline). Not run here; the underlying capabilities (manifest, activated SW, offline) are all verified above
