## 1. Remove the commit-count build version

- [x] 1.1 In `next.config.ts`, delete `computeBuildVersion()`, the `buildVersion`
      const (and its `git rev-list` `execSync`), and the `NEXT_PUBLIC_BUILD_VERSION`
      env entry. Keep `buildTime` / `NEXT_PUBLIC_BUILD_TIME`.
- [x] 1.2 In `src/lib/version.ts`, delete `getBuildVersion()` and update the file
      comment to describe the `builtAt` scheme. Keep `getBuiltAt()`.

## 2. Endpoint returns `builtAt` only

- [x] 2.1 In `src/app/version.json/route.ts`, drop the `version` field; return
      `{ builtAt }`. Update the comment to say the client compares `builtAt`.

## 3. Poll compares `builtAt` and is cache-busted

- [x] 3.1 In `useServiceWorker.ts`, import `getBuiltAt` instead of
      `getBuildVersion`; `const currentBuiltAt = getBuiltAt()`.
- [x] 3.2 Rename `checkForNewVersion` to `checkForNewBuild`; fetch
      `/version.json?ts=${Date.now()}` with `cache: 'no-store'`.
- [x] 3.3 Parse `data: { builtAt?: string }`; call `serwist.update()` when
      `new Date(data.builtAt)` is valid and strictly later than `currentBuiltAt`.
- [x] 3.4 Update the hook doc comment (it references version.json's `version`).

## 4. Verify

- [x] 4.1 `pnpm build`; confirm `out/version.json` has `builtAt` and no `version`;
      grep the export for leftover `NEXT_PUBLIC_BUILD_VERSION`.
- [x] 4.2 `pnpm lint` clean; no dangling `getBuildVersion` imports.
- [x] 4.3 Serve the export, then rebuild with a later timestamp and re-serve;
      confirm the "Update available" toast appears within a poll tick / on focus,
      and Reload clears caches and loads the new build.
