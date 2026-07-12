## Context

Update detection has two triggers feeding one `updateReady` signal in
`useServiceWorker`: the service worker `waiting` lifecycle event, and a poll of
`/version.json`. Only the poll is broken; the swap flow (waiting -> toast ->
`messageSkipWaiting` -> `controlling` -> clear caches -> reload) and `sw.ts` are
untouched by this change.

## Goals

- Detection driven by a git-independent build identity that actually changes per
  deploy.
- No CI/workflow change; remove the git dependency rather than patch clone depth.
- A deploy surfaces on the next poll tick, not after CDN TTL expiry.

## Decisions

### Compare `builtAt`, drop the integer `version`

`builtAt` is `new Date().toISOString()` evaluated once in `next.config.ts` and
exposed through `NEXT_PUBLIC_BUILD_TIME`. Both the client (`getBuiltAt()`) and
`version.json` read the same env, so they are identical within a build and differ
across builds. This removes the commit-count scheme (and its shallow-clone
failure) entirely.

Comparison uses parsed epoch millis to avoid string-format assumptions:

```
Number.isFinite(new Date(data.builtAt).getTime())
  && new Date(data.builtAt).getTime() > new Date(currentBuiltAt).getTime()
```

Alternatives rejected:
- `fetch-depth: 0` in CI: fixes the count but keeps a fragile git-history
  dependency and a CI-config coupling for a purely client concern.
- Content hash of the bundle: more work, no benefit over a timestamp here.

### Cache-bust the poll

Fetch `/version.json?ts=${Date.now()}` with `cache: 'no-store'`. `no-store` only
governs the browser cache; the unique query defeats intermediary/CDN caches
(observed `cache-control: max-age=600` + Fastly `age`) and any service-worker
runtime cache, so every poll is origin-fresh and a new deploy is seen within one
tick (<=60s) or on tab focus / `online`.

## Risks / Tradeoffs

- A manual CI re-run of the same commit produces a new `builtAt` and one no-op
  reload. Accepted: deploys ride new commits on push to master.
- Endpoint shape change (`version` removed) is safe: the only consumer is this
  client, and an old cached client that still reads `version` simply falls back
  to the SW-lifecycle trigger until it reloads.

## Migration

None required at runtime. Currently-deployed clients (baked `builtAt` from their
own build) will see the first post-change deploy as strictly later and surface
the toast normally.
