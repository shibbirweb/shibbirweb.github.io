import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePrefersReducedMotion } from '@/components/pages/articles/hooks/usePrefersReducedMotion';

type ChangeListener = (event: MediaQueryListEvent) => void;

/** A controllable media query, so a test can flip the OS setting mid-render. */
function stubReducedMotionQuery(initiallyMatches: boolean) {
    const listeners = new Set<ChangeListener>();
    const queryList = {
        matches: initiallyMatches,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn((_type: string, listener: ChangeListener) => {
            listeners.add(listener);
        }),
        removeEventListener: vi.fn(
            (_type: string, listener: ChangeListener) => {
                listeners.delete(listener);
            }
        ),
    };
    const matchMedia = vi
        .spyOn(window, 'matchMedia')
        .mockImplementation(() => queryList as unknown as MediaQueryList);

    const change = (matches: boolean) => {
        queryList.matches = matches;
        for (const listener of listeners) {
            listener({ matches } as MediaQueryListEvent);
        }
    };

    return { matchMedia, queryList, listeners, change };
}

describe('usePrefersReducedMotion', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('reports false when the visitor has not asked for reduced motion', () => {
        const { matchMedia } = stubReducedMotionQuery(false);

        const { result } = renderHook(() => usePrefersReducedMotion());

        expect(result.current).toBe(false);
        expect(matchMedia).toHaveBeenCalledWith(
            '(prefers-reduced-motion: reduce)'
        );
    });

    it('reports true once mounted when the visitor asks for reduced motion', () => {
        stubReducedMotionQuery(true);

        const { result } = renderHook(() => usePrefersReducedMotion());

        expect(result.current).toBe(true);
    });

    it('follows changes to the media query', () => {
        const { change } = stubReducedMotionQuery(false);
        const { result } = renderHook(() => usePrefersReducedMotion());

        act(() => change(true));
        expect(result.current).toBe(true);

        act(() => change(false));
        expect(result.current).toBe(false);
    });

    it('stops listening when unmounted', () => {
        const { listeners, queryList } = stubReducedMotionQuery(false);
        const { unmount } = renderHook(() => usePrefersReducedMotion());
        expect(listeners.size).toBe(1);

        unmount();

        expect(listeners.size).toBe(0);
        expect(queryList.removeEventListener).toHaveBeenCalledWith(
            'change',
            expect.any(Function)
        );
    });
});
