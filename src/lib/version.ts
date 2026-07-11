// The build version is a monotonically increasing integer (git commit count),
// computed once in next.config.ts and baked into NEXT_PUBLIC_BUILD_VERSION so the
// client, the version.json route, and the update poll all read the same value.
// A newer deploy has a strictly greater version, which is how the client detects
// that an update is available.

/** The current build's version number. Falls back to 0 when unset. */
export function getBuildVersion(): number {
    const raw = Number(process.env.NEXT_PUBLIC_BUILD_VERSION);
    return Number.isFinite(raw) ? raw : 0;
}

/** ISO timestamp of when this build was produced. */
export function getBuiltAt(): string {
    return process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date(0).toISOString();
}
