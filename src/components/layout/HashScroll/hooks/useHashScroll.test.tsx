import { renderHook, waitFor } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
    type Mock,
} from 'vitest';
import { isScrollSyncLocked } from '@/components/layout/scrollSyncLock';
import { useHashScroll } from '@/components/layout/HashScroll/hooks/useHashScroll';

describe('useHashScroll', () => {
    let scrollToSpy: ReturnType<typeof vi.spyOn>;
    let target: HTMLElement;
    let scrollIntoView: Mock<Element['scrollIntoView']>;

    beforeEach(() => {
        scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        vi.stubGlobal(
            'requestAnimationFrame',
            (callback: FrameRequestCallback) => {
                callback(0);
                return 1;
            }
        );
        target = document.createElement('section');
        target.id = 'skills';
        scrollIntoView = vi.fn<Element['scrollIntoView']>();
        target.scrollIntoView = scrollIntoView;
        document.body.appendChild(target);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        target.remove();
        window.history.replaceState(null, '', '/');
        document.documentElement.style.scrollBehavior = '';
    });

    function preferReducedMotion(reduce: boolean) {
        vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
            matches: query === '(prefers-reduced-motion: reduce)' && reduce,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }));
    }

    it('does nothing without a fragment', () => {
        renderHook(() => useHashScroll());

        expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('does nothing when the fragment has no matching element', () => {
        window.history.replaceState(null, '', '/#missing');

        renderHook(() => useHashScroll());

        expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('snaps to the top, then glides smoothly to the section', async () => {
        window.history.replaceState(null, '', '/#skills');

        renderHook(() => useHashScroll());

        expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
        await waitFor(() =>
            expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
        );
    });

    it('jumps without animation for reduced-motion visitors', async () => {
        preferReducedMotion(true);
        window.history.replaceState(null, '', '/#skills');

        renderHook(() => useHashScroll());

        await waitFor(() =>
            expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' })
        );
    });

    it('holds the section URL sync off during the take-over', () => {
        window.history.replaceState(null, '', '/#skills');

        renderHook(() => useHashScroll());

        expect(isScrollSyncLocked()).toBe(true);
    });

    it('restores the page scroll behavior after the instant snap', () => {
        document.documentElement.style.scrollBehavior = 'smooth';
        window.history.replaceState(null, '', '/#skills');

        renderHook(() => useHashScroll());

        expect(document.documentElement.style.scrollBehavior).toBe('smooth');
    });

    it('decodes an encoded fragment before looking up the element', async () => {
        target.id = 'über';
        window.history.replaceState(null, '', '/#%C3%BCber');

        renderHook(() => useHashScroll());

        await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    });

    describe('when the smooth glide stops short', () => {
        const SECTION_TOP = 900;

        beforeEach(() => {
            // The glide "starts" but the page never moves: scrollY stays 0
            // while the section sits 900px down a page tall enough to reach it.
            vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
                top: SECTION_TOP,
            } as DOMRect);
            Object.defineProperty(document.documentElement, 'scrollHeight', {
                configurable: true,
                value: 5_000,
            });
        });

        afterEach(() => {
            Object.defineProperty(document.documentElement, 'scrollHeight', {
                configurable: true,
                value: 0,
            });
        });

        it('finishes the trip instantly once the glide ends', async () => {
            window.history.replaceState(null, '', '/#skills');

            renderHook(() => useHashScroll());
            await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
            window.dispatchEvent(new Event('scrollend'));

            expect(scrollToSpy).toHaveBeenLastCalledWith(0, SECTION_TOP);
            expect(isScrollSyncLocked()).toBe(true);
        });

        it('checks the landing even without a scrollend event', async () => {
            window.history.replaceState(null, '', '/#skills');

            renderHook(() => useHashScroll());
            await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());

            await waitFor(
                () =>
                    expect(scrollToSpy).toHaveBeenLastCalledWith(
                        0,
                        SECTION_TOP
                    ),
                { timeout: 2_500 }
            );
        });

        it('leaves the page alone when the glide arrived', async () => {
            vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
                top: 0,
            } as DOMRect);
            window.history.replaceState(null, '', '/#skills');

            renderHook(() => useHashScroll());
            await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
            window.dispatchEvent(new Event('scrollend'));

            // Only the initial snap to the top, no correction.
            expect(scrollToSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('skips the glide when unmounted before it starts', async () => {
        window.history.replaceState(null, '', '/#skills');

        const { unmount } = renderHook(() => useHashScroll());
        unmount();
        // jsdom has no document.fonts, so the settle race resolves on a
        // microtask; one macrotask turn lets it run to completion.
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(scrollIntoView).not.toHaveBeenCalled();
    });
});
