import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDrawOnScroll } from '@/components/pages/home/AboutMeArea/hooks/useDrawOnScroll';

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

function DrawHarness({ attachRef = true }: { attachRef?: boolean }) {
    const { ref, state } = useDrawOnScroll<HTMLDivElement>(0.5);

    return (
        <div ref={attachRef ? ref : undefined}>
            <output>{state}</output>
        </div>
    );
}

function preferReducedMotion() {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    }));
}

describe('useDrawOnScroll', () => {
    beforeEach(() => {
        RecordingIntersectionObserver.instances = [];
        vi.stubGlobal('IntersectionObserver', RecordingIntersectionObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('stays static (fully drawn) for reduced-motion visitors', () => {
        preferReducedMotion();

        render(<DrawHarness />);

        expect(screen.getByRole('status')).toHaveTextContent('static');
        expect(RecordingIntersectionObserver.instances).toHaveLength(0);
    });

    it('draws immediately when there is no element to observe', () => {
        render(<DrawHarness attachRef={false} />);

        expect(screen.getByRole('status')).toHaveTextContent('drawn');
    });

    it('collapses first and observes the element with the threshold', () => {
        render(<DrawHarness />);

        expect(screen.getByRole('status')).toHaveTextContent('collapsed');
        const [observer] = RecordingIntersectionObserver.instances;
        expect(observer.observed).toEqual([
            screen.getByRole('status').parentElement,
        ]);
        expect(observer.options).toEqual({ threshold: 0.5 });
    });

    it('stays collapsed until the element scrolls into view', () => {
        render(<DrawHarness />);
        const [observer] = RecordingIntersectionObserver.instances;

        act(() => observer.callback([{ isIntersecting: false }]));

        expect(screen.getByRole('status')).toHaveTextContent('collapsed');
    });

    it('draws once in view and stops observing', () => {
        render(<DrawHarness />);
        const [observer] = RecordingIntersectionObserver.instances;

        act(() => observer.callback([{ isIntersecting: true }]));

        expect(screen.getByRole('status')).toHaveTextContent('drawn');
        expect(observer.disconnect).toHaveBeenCalled();
    });
});
