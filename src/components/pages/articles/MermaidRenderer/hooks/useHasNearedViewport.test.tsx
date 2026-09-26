import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useHasNearedViewport } from '@/components/pages/articles/MermaidRenderer/hooks/useHasNearedViewport';

/** Stubs IntersectionObserver; the returned object drives and inspects it. */
function stubIntersectionObserver() {
    const observer = {
        report: (() => {}) as (isIntersecting: boolean) => void,
        rootMargin: '',
        disconnect: vi.fn(),
    };
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            constructor(
                callback: IntersectionObserverCallback,
                options?: IntersectionObserverInit
            ) {
                observer.rootMargin = options?.rootMargin ?? '';
                observer.report = (isIntersecting) =>
                    callback(
                        [{ isIntersecting } as IntersectionObserverEntry],
                        this as unknown as IntersectionObserver
                    );
            }
            observe() {}
            disconnect = observer.disconnect;
        }
    );
    return observer;
}

function renderNearViewport(rootMargin?: string) {
    const element = document.createElement('div');
    return renderHook(() =>
        useHasNearedViewport({ current: element }, rootMargin)
    );
}

describe('useHasNearedViewport', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('is false until the element nears the viewport', () => {
        const observer = stubIntersectionObserver();
        const { result } = renderNearViewport();

        expect(result.current).toBe(false);
        act(() => observer.report(false));
        expect(result.current).toBe(false);

        act(() => observer.report(true));
        expect(result.current).toBe(true);
    });

    it('stays true once the element has been near, and stops watching', () => {
        const observer = stubIntersectionObserver();
        const { result } = renderNearViewport();

        act(() => observer.report(true));
        act(() => observer.report(false));

        expect(result.current).toBe(true);
        expect(observer.disconnect).toHaveBeenCalled();
    });

    it('starts well before the element scrolls in', () => {
        const observer = stubIntersectionObserver();
        renderNearViewport();

        expect(observer.rootMargin).toBe('600px 0px');
    });

    it('honours a custom margin', () => {
        const observer = stubIntersectionObserver();
        renderNearViewport('100px 0px');

        expect(observer.rootMargin).toBe('100px 0px');
    });

    it('reports true at once where IntersectionObserver is missing', () => {
        vi.stubGlobal('IntersectionObserver', undefined);
        // `'IntersectionObserver' in window` must be false for this path.
        const descriptor = Object.getOwnPropertyDescriptor(
            window,
            'IntersectionObserver'
        );
        delete (window as { IntersectionObserver?: unknown })
            .IntersectionObserver;
        try {
            const { result } = renderNearViewport();
            expect(result.current).toBe(true);
        } finally {
            if (descriptor) {
                Object.defineProperty(
                    window,
                    'IntersectionObserver',
                    descriptor
                );
            }
        }
    });
});
