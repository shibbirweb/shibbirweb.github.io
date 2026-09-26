import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lockScrollSync } from '@/components/layout/scrollSyncLock';
import { useSectionUrlSync } from '@/components/layout/SectionUrlSync/hooks/useSectionUrlSync';

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

describe('useSectionUrlSync', () => {
    let systemTime = Date.UTC(2030, 0, 1);
    let replaceStateSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // The lock is module state keyed on Date.now(), so move the clock well
        // past any lock an earlier test left behind.
        systemTime += 3_600_000;
        vi.useFakeTimers();
        vi.setSystemTime(systemTime);
        window.history.replaceState(null, '', '/');
        replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        window.history.replaceState(null, '', '/');
    });

    function renderSync(activeId: string | null) {
        return renderHook(
            ({ sectionId }) => useSectionUrlSync(sectionId, 'hero'),
            { initialProps: { sectionId: activeId } }
        );
    }

    it('writes nothing before a section is known', () => {
        renderSync(null);

        expect(replaceStateSpy).not.toHaveBeenCalled();
    });

    it('writes the active section into the hash', () => {
        renderSync('about');

        expect(window.location.hash).toBe('#about');
        expect(window.history.length).toBe(1);
    });

    it('replaces the entry instead of pushing a new one', () => {
        renderSync('skills');

        expect(replaceStateSpy).toHaveBeenCalledWith(
            window.history.state,
            '',
            '/#skills'
        );
    });

    it('clears the hash at the hero', () => {
        window.history.replaceState(null, '', '/#work');
        replaceStateSpy.mockClear();

        renderSync('hero');

        expect(window.location.hash).toBe('');
        expect(replaceStateSpy).toHaveBeenCalledWith(
            window.history.state,
            '',
            '/'
        );
    });

    it('keeps the query string', () => {
        window.history.replaceState(null, '', '/?ref=feed');

        renderSync('work');

        expect(window.location.search).toBe('?ref=feed');
        expect(window.location.hash).toBe('#work');
    });

    it('skips the write when the hash already matches', () => {
        window.history.replaceState(null, '', '/#about');
        replaceStateSpy.mockClear();

        renderSync('about');

        expect(replaceStateSpy).not.toHaveBeenCalled();
    });

    it('follows the active section as it changes', () => {
        const { rerender } = renderSync('about');

        rerender({ sectionId: 'contact' });

        expect(window.location.hash).toBe('#contact');
    });

    it('defers the write while a programmatic scroll holds the lock', () => {
        lockScrollSync(500);

        renderSync('skills');
        expect(replaceStateSpy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(549);
        expect(replaceStateSpy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(window.location.hash).toBe('#skills');
    });

    it('keeps waiting when the lock is extended during the retry', () => {
        lockScrollSync(500);
        renderSync('skills');

        vi.advanceTimersByTime(400);
        lockScrollSync(1000);
        vi.advanceTimersByTime(150);
        expect(replaceStateSpy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);
        expect(window.location.hash).toBe('#skills');
    });

    it('drops a pending retry on unmount', () => {
        lockScrollSync(500);
        const { unmount } = renderSync('skills');

        unmount();
        vi.advanceTimersByTime(1000);

        expect(replaceStateSpy).not.toHaveBeenCalled();
    });
});
