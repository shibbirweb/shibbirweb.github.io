// The build identity is a fresh ISO timestamp, computed once in next.config.ts
// and baked into NEXT_PUBLIC_BUILD_TIME so the client and the version.json route
// read the same value. A newer deploy has a strictly later builtAt, which is how
// the client detects that an update is available (no git history involved).

/** ISO timestamp of when this build was produced. Falls back to the epoch when unset. */
export function getBuiltAt(): string {
    return process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date(0).toISOString();
}
