// Browser side of the footer's GitHub activity: the localStorage cache and the
// proxy request. Every storage access is wrapped, since storage can be missing
// or throw (private windows, blocked site data); any failure simply leaves the
// graph on its decorative fallback. Local development skips the cache
// entirely, so every reload fetches fresh data.

import { isDevelopment } from '@/config/env';
import {
    githubActivityCacheKey,
    githubActivityDays,
    githubActivityMaxAgeMs,
    githubActivityTimeoutMs,
    githubActivityURL,
} from '@/components/layout/Footer/SignatureSpotlight/contents';
import {
    CachedGithubActivity,
    decodeCachedActivity,
    encodeCachedActivity,
    isActivityFresh,
    keepRecentDays,
    parseContributionLevels,
    toLocalIsoDate,
} from '@/components/layout/Footer/SignatureSpotlight/githubActivity';

// Start the request a little before the footer scrolls into view, so the real
// graph is usually in place by the time the visitor reaches it.
const PREFETCH_MARGIN = '600px 0px';

export function readCachedActivity(): CachedGithubActivity | null {
    try {
        return decodeCachedActivity(
            window.localStorage.getItem(githubActivityCacheKey)
        );
    } catch {
        return null;
    }
}

export function writeCachedActivity(levels: number[], savedAt: number): void {
    try {
        window.localStorage.setItem(
            githubActivityCacheKey,
            encodeCachedActivity(levels, savedAt)
        );
    } catch {
        // Ignore write failures (private mode, storage full or disabled).
    }
}

export async function fetchGithubActivity(
    signal: AbortSignal
): Promise<number[] | null> {
    try {
        const response = await fetch(githubActivityURL, { signal });
        if (!response.ok) {
            return null;
        }
        const levels = parseContributionLevels(
            await response.json(),
            toLocalIsoDate(new Date())
        );
        return levels && keepRecentDays(levels, githubActivityDays);
    } catch {
        return null;
    }
}

/**
 * Feeds `onLevels` the maintainer's contribution levels for the last
 * githubActivityDays days, one per day, oldest first. A cached
 * copy is handed over at once, even if stale; when there is none, or it is
 * older than githubActivityMaxAgeMs, the proxy is called once the footer
 * (`target`) nears the viewport, and a good response is cached and handed over
 * too. In development the cache is neither read nor written, so the proxy is
 * called on every load. Returns a cleanup that cancels anything still pending.
 */
export function watchGithubActivity(
    target: Element,
    onLevels: (levels: number[]) => void
): () => void {
    const cached = isDevelopment ? null : readCachedActivity();
    if (cached) {
        // Trimmed on read too, so an entry cached with a longer range still
        // shows only the recent days.
        onLevels(keepRecentDays(cached.levels, githubActivityDays));
    }
    if (
        cached &&
        isActivityFresh(cached.savedAt, Date.now(), githubActivityMaxAgeMs)
    ) {
        return () => {};
    }

    const controller = new AbortController();
    let timeout = 0;
    const load = () => {
        timeout = window.setTimeout(
            () => controller.abort(),
            githubActivityTimeoutMs
        );
        fetchGithubActivity(controller.signal).then((levels) => {
            window.clearTimeout(timeout);
            if (!levels || controller.signal.aborted) {
                return;
            }
            if (!isDevelopment) {
                writeCachedActivity(levels, Date.now());
            }
            onLevels(levels);
        });
    };

    if (typeof IntersectionObserver === 'undefined') {
        load();
        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }
    const observer = new IntersectionObserver(
        (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) {
                return;
            }
            observer.disconnect();
            load();
        },
        { rootMargin: PREFETCH_MARGIN }
    );
    observer.observe(target);

    return () => {
        observer.disconnect();
        window.clearTimeout(timeout);
        controller.abort();
    };
}
