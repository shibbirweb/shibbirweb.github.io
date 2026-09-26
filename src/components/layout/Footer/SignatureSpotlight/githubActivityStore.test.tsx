import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Vitest runs with NODE_ENV=test, which @/config/env counts as development, so
// the flag is mocked: production behaviour by default, flipped per test.
const env = vi.hoisted(() => ({ isDevelopment: false }));
vi.mock('@/config/env', () => ({
    get isDevelopment() {
        return env.isDevelopment;
    },
    get isProduction() {
        return !env.isDevelopment;
    },
}));
import {
    githubActivityCacheKey,
    githubActivityDays,
    githubActivityMaxAgeMs,
    githubActivityURL,
} from '@/components/layout/Footer/SignatureSpotlight/contents';
import { encodeCachedActivity } from '@/components/layout/Footer/SignatureSpotlight/githubActivity';
import {
    readCachedActivity,
    watchGithubActivity,
} from '@/components/layout/Footer/SignatureSpotlight/githubActivityStore';

const response = {
    contributions: [
        { date: '2026-01-01', count: 0, level: 0 },
        { date: '2026-01-02', count: 3, level: 2 },
    ],
};

function mockFetch(body: unknown, ok = true) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok,
        json: () => Promise.resolve(body),
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

// Resolves once pending promise callbacks (the mocked fetch chain) have run.
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Replaces the test setup's inert IntersectionObserver with one the test
 * drives: the returned function reports the footer entering or leaving the
 * prefetch margin.
 */
function stubIntersectionObserver() {
    let reportIntersection: (isIntersecting: boolean) => void = () => {};
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            constructor(callback: IntersectionObserverCallback) {
                reportIntersection = (isIntersecting) =>
                    callback(
                        [{ isIntersecting } as IntersectionObserverEntry],
                        this as unknown as IntersectionObserver
                    );
            }
            observe() {}
            disconnect() {}
        }
    );
    return (isIntersecting: boolean) => reportIntersection(isIntersecting);
}

describe('watchGithubActivity', () => {
    const target = document.createElement('div');

    beforeEach(() => {
        window.localStorage.clear();
        env.isDevelopment = false;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('fetches, caches and hands over the levels when nothing is cached', async () => {
        const fetchMock = mockFetch(response);
        const reportIntersection = stubIntersectionObserver();
        const onLevels = vi.fn();
        watchGithubActivity(target, onLevels);
        reportIntersection(true);
        await flushPromises();

        expect(fetchMock).toHaveBeenCalledWith(
            githubActivityURL,
            expect.objectContaining({ signal: expect.anything() })
        );
        expect(onLevels).toHaveBeenCalledWith([0, 2]);
        expect(readCachedActivity()?.levels).toEqual([0, 2]);
    });

    it('uses a fresh cache without calling the proxy', async () => {
        const fetchMock = mockFetch(response);
        const reportIntersection = stubIntersectionObserver();
        window.localStorage.setItem(
            githubActivityCacheKey,
            encodeCachedActivity([1, 3], Date.now() - 1000)
        );
        const onLevels = vi.fn();
        watchGithubActivity(target, onLevels);
        reportIntersection(true);
        await flushPromises();

        expect(onLevels).toHaveBeenCalledTimes(1);
        expect(onLevels).toHaveBeenCalledWith([1, 3]);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('shows a stale cache at once, then refreshes it', async () => {
        const fetchMock = mockFetch(response);
        window.localStorage.setItem(
            githubActivityCacheKey,
            encodeCachedActivity([1, 3], Date.now() - githubActivityMaxAgeMs)
        );
        const reportIntersection = stubIntersectionObserver();
        const onLevels = vi.fn();
        watchGithubActivity(target, onLevels);
        expect(onLevels).toHaveBeenNthCalledWith(1, [1, 3]);
        reportIntersection(true);
        await flushPromises();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(onLevels).toHaveBeenNthCalledWith(2, [0, 2]);
    });

    it('keeps only the most recent days, including from an older cache', async () => {
        mockFetch(response);
        const yearLong = Array.from({ length: 365 }, (_, day) => day % 5);
        window.localStorage.setItem(
            githubActivityCacheKey,
            encodeCachedActivity(yearLong, Date.now() - 1000)
        );
        const onLevels = vi.fn();
        watchGithubActivity(target, onLevels);
        await flushPromises();

        expect(onLevels).toHaveBeenCalledWith(
            yearLong.slice(-githubActivityDays)
        );
    });

    it('skips the cache entirely in development', async () => {
        env.isDevelopment = true;
        const fetchMock = mockFetch(response);
        const reportIntersection = stubIntersectionObserver();
        window.localStorage.setItem(
            githubActivityCacheKey,
            encodeCachedActivity([1, 3], Date.now() - 1000)
        );
        const onLevels = vi.fn();
        watchGithubActivity(target, onLevels);
        reportIntersection(true);
        await flushPromises();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(onLevels).toHaveBeenCalledTimes(1);
        expect(onLevels).toHaveBeenCalledWith([0, 2]);
        expect(readCachedActivity()?.levels).toEqual([1, 3]);
    });

    it('leaves the graph alone when the proxy fails', async () => {
        const fetchMock = mockFetch({}, false);
        const reportIntersection = stubIntersectionObserver();
        const onLevels = vi.fn();
        watchGithubActivity(target, onLevels);
        reportIntersection(true);
        await flushPromises();

        expect(fetchMock).toHaveBeenCalledTimes(1);

        expect(onLevels).not.toHaveBeenCalled();
        expect(readCachedActivity()).toBeNull();
    });

    it('waits for the footer to near the viewport before fetching', async () => {
        const fetchMock = mockFetch(response);
        const reportIntersection = stubIntersectionObserver();
        const onLevels = vi.fn();
        watchGithubActivity(target, onLevels);

        reportIntersection(false);
        await flushPromises();
        expect(fetchMock).not.toHaveBeenCalled();

        reportIntersection(true);
        await flushPromises();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(onLevels).toHaveBeenCalledWith([0, 2]);
    });

    it('drops a response that lands after cleanup', async () => {
        mockFetch(response);
        const reportIntersection = stubIntersectionObserver();
        const onLevels = vi.fn();
        const stopWatching = watchGithubActivity(target, onLevels);
        reportIntersection(true);
        stopWatching();
        await flushPromises();

        expect(onLevels).not.toHaveBeenCalled();
    });
});
