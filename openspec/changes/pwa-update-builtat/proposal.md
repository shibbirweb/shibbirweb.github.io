## Why

The PWA update poll compares a build version baked into the client against the
deployed `version.json`. That version is the git commit count
(`git rev-list --count HEAD`), but CI checks out a shallow clone
(`actions/checkout` default `fetch-depth: 1`), so the count is always `1`. Both
the client and the endpoint report `1`, so the poll check `deployed > current`
is never true and the version-poll fast path is a no-op in production. Live
proof: `https://shibbir.me/version.json` returns `{"version":1,"builtAt":...}`.

The build already carries a `builtAt` timestamp that updates every deploy and
does not depend on git history. Comparing `builtAt` instead removes the broken
version entirely and fixes detection without any CI change.

## What Changes

- **BREAKING** (endpoint shape): `version.json` drops the `version` field and
  returns `{ builtAt }` only. The client compares its own baked `builtAt`
  against the deployed one; a strictly later deployed `builtAt` means an update
  is available.
- Remove the git commit-count build version end to end: the `NEXT_PUBLIC_BUILD_VERSION`
  env, the `git rev-list` call in `next.config.ts`, and `getBuildVersion()`.
- Cache-bust the version poll (`/version.json?ts=<now>` with `cache: 'no-store'`)
  so a new deploy is picked up on the next poll tick instead of being masked by
  CDN caching (observed `cache-control: max-age=600`).
- No change to the update swap flow (waiting worker, toast, skip-waiting,
  cache clear, reload) or to `sw.ts`. No CI/workflow change.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `pwa`: the "Build version endpoint" requirement changes from a monotonically
  increasing integer `version` to a `builtAt` timestamp (the endpoint no longer
  emits `version`); the "Update-available notification and reload" requirement's
  version-poll scenario compares `builtAt` and requires the poll to be
  cache-busted so each poll is origin-fresh.

## Impact

- Static export: `out/version.json` body shape changes (`version` removed). No
  new runtime behavior; still fully static.
- Code: `next.config.ts`, `src/lib/version.ts`, `src/app/version.json/route.ts`,
  `src/components/pwa/ServiceWorkerManager/hooks/useServiceWorker.ts`.
- Deployment: removes the dependency on git clone depth in CI; the shallow-clone
  root cause is gone because git no longer feeds the version.
- Tradeoff: a manual CI re-run of the same commit yields a new `builtAt` and
  would trigger one no-op reload. Acceptable, since deploys ride new commits.
