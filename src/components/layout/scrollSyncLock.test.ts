import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ScrollSyncLockModule = typeof import('@/components/layout/scrollSyncLock');

let scrollSyncLock: ScrollSyncLockModule;

beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-26T12:00:00Z'));
    vi.resetModules();
    scrollSyncLock = await import('@/components/layout/scrollSyncLock');
});

afterEach(() => {
    vi.useRealTimers();
});

describe('scrollSyncLock', () => {
    it('starts unlocked with nothing remaining', () => {
        expect(scrollSyncLock.isScrollSyncLocked()).toBe(false);
        expect(scrollSyncLock.scrollSyncLockRemaining()).toBe(0);
    });

    it('locks for the requested duration', () => {
        scrollSyncLock.lockScrollSync(800);
        expect(scrollSyncLock.isScrollSyncLocked()).toBe(true);
        expect(scrollSyncLock.scrollSyncLockRemaining()).toBe(800);

        vi.advanceTimersByTime(300);
        expect(scrollSyncLock.isScrollSyncLocked()).toBe(true);
        expect(scrollSyncLock.scrollSyncLockRemaining()).toBe(500);
    });

    it('expires on its own once the duration passes', () => {
        scrollSyncLock.lockScrollSync(800);
        vi.advanceTimersByTime(800);
        expect(scrollSyncLock.isScrollSyncLocked()).toBe(false);
        expect(scrollSyncLock.scrollSyncLockRemaining()).toBe(0);
    });

    it('extends the lock when a longer one is requested', () => {
        scrollSyncLock.lockScrollSync(500);
        vi.advanceTimersByTime(200);
        scrollSyncLock.lockScrollSync(1000);
        expect(scrollSyncLock.scrollSyncLockRemaining()).toBe(1000);
    });

    it('never shortens an existing lock', () => {
        scrollSyncLock.lockScrollSync(1000);
        scrollSyncLock.lockScrollSync(100);
        expect(scrollSyncLock.scrollSyncLockRemaining()).toBe(1000);

        vi.advanceTimersByTime(500);
        expect(scrollSyncLock.isScrollSyncLocked()).toBe(true);
    });

    it('can be locked again after it expires', () => {
        scrollSyncLock.lockScrollSync(100);
        vi.advanceTimersByTime(150);
        expect(scrollSyncLock.isScrollSyncLocked()).toBe(false);
        scrollSyncLock.lockScrollSync(200);
        expect(scrollSyncLock.isScrollSyncLocked()).toBe(true);
    });
});
