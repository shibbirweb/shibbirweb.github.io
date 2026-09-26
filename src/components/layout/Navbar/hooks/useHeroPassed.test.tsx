import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHeroPassed } from '@/components/layout/Navbar/hooks/useHeroPassed';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

class RecordingIntersectionObserver {
    static instances: RecordingIntersectionObserver[] = [];
    observed: Element[] = [];
    disconnect = vi.fn();

    constructor(
        public callback: ObserverCallback,
        public options?: IntersectionObserverInit
    ) {
        RecordingIntersectionObserver.instances.push(this);
    }

    observe(element: Element) {
        this.observed.push(element);
    }

    unobserve() {}

    takeRecords() {
        return [];
    }
}

describe('useHeroPassed', () => {
    beforeEach(() => {
        RecordingIntersectionObserver.instances = [];
        vi.stubGlobal('IntersectionObserver', RecordingIntersectionObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        document.body.innerHTML = '';
    });

    function addHero() {
        const hero = document.createElement('section');
        hero.id = 'hero';
        document.body.appendChild(hero);
        return hero;
    }

    it('reports passed off the home page', () => {
        addHero();

        const { result } = renderHook(() => useHeroPassed(false, 'hero'));

        expect(result.current).toBe(true);
        expect(RecordingIntersectionObserver.instances).toHaveLength(0);
    });

    it('reports passed when the hero is missing', () => {
        const { result } = renderHook(() => useHeroPassed(true, 'hero'));

        expect(result.current).toBe(true);
    });

    it('starts not passed on home and observes the hero', () => {
        const hero = addHero();

        const { result } = renderHook(() => useHeroPassed(true, 'hero'));

        expect(result.current).toBe(false);
        const [observer] = RecordingIntersectionObserver.instances;
        expect(observer.observed).toEqual([hero]);
        expect(observer.options?.rootMargin).toBe('-50% 0px 0px 0px');
    });

    it('flips both ways as the hero leaves and returns', () => {
        addHero();
        const { result } = renderHook(() => useHeroPassed(true, 'hero'));
        const [observer] = RecordingIntersectionObserver.instances;

        act(() => observer.callback([{ isIntersecting: false }]));
        expect(result.current).toBe(true);

        act(() => observer.callback([{ isIntersecting: true }]));
        expect(result.current).toBe(false);
    });

    it('disconnects the observer on unmount', () => {
        addHero();
        const { unmount } = renderHook(() => useHeroPassed(true, 'hero'));
        const [observer] = RecordingIntersectionObserver.instances;

        unmount();

        expect(observer.disconnect).toHaveBeenCalled();
    });
});
