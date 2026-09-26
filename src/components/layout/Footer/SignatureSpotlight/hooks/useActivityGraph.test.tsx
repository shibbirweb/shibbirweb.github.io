import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useActivityGraph } from '@/components/layout/Footer/SignatureSpotlight/hooks/useActivityGraph';
import { startActivityGraph } from '@/components/layout/Footer/SignatureSpotlight/startActivityGraph';

vi.mock(
    '@/components/layout/Footer/SignatureSpotlight/startActivityGraph',
    () => ({
        startActivityGraph: vi.fn(),
    })
);
const mockedStart = vi.mocked(startActivityGraph);

/**
 * Replaces the test setup's inert IntersectionObserver with one the test
 * drives; the returned function reports the footer entering or leaving the
 * margin around the viewport.
 */
function stubIntersectionObserver() {
    let reportIntersection: (isIntersecting: boolean) => void = () => {};
    const disconnect = vi.fn();
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
            disconnect = disconnect;
        }
    );
    return {
        report: (isIntersecting: boolean) => reportIntersection(isIntersecting),
        disconnect,
    };
}

function renderGraphHook() {
    const canvas = document.createElement('canvas');
    const spotlight = document.createElement('div');
    const hook = renderHook(() =>
        useActivityGraph({ current: canvas }, { current: spotlight })
    );
    return { ...hook, canvas, spotlight };
}

describe('useActivityGraph', () => {
    const stopGraph = vi.fn();

    beforeEach(() => {
        stopGraph.mockReset();
        mockedStart.mockReset();
        mockedStart.mockReturnValue(stopGraph);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('waits for the footer to near the viewport before building the graph', () => {
        const intersection = stubIntersectionObserver();
        const { canvas, spotlight } = renderGraphHook();

        intersection.report(false);
        expect(mockedStart).not.toHaveBeenCalled();

        intersection.report(true);
        expect(mockedStart).toHaveBeenCalledTimes(1);
        expect(mockedStart).toHaveBeenCalledWith(canvas, spotlight);
        expect(intersection.disconnect).toHaveBeenCalled();
    });

    it('stops the graph when unmounted', () => {
        const intersection = stubIntersectionObserver();
        const { unmount } = renderGraphHook();
        intersection.report(true);

        unmount();

        expect(stopGraph).toHaveBeenCalledTimes(1);
    });

    it('never builds the graph when unmounted before the footer nears', () => {
        const intersection = stubIntersectionObserver();
        const { unmount } = renderGraphHook();

        unmount();

        expect(intersection.disconnect).toHaveBeenCalled();
        expect(mockedStart).not.toHaveBeenCalled();
    });

    it('builds the graph at once where IntersectionObserver is missing', () => {
        vi.stubGlobal('IntersectionObserver', undefined);
        const { unmount } = renderGraphHook();

        expect(mockedStart).toHaveBeenCalledTimes(1);
        unmount();
        expect(stopGraph).toHaveBeenCalledTimes(1);
    });

    it('copes with a canvas that cannot draw', () => {
        mockedStart.mockReturnValue(null);
        const intersection = stubIntersectionObserver();
        const { unmount } = renderGraphHook();
        intersection.report(true);

        expect(() => unmount()).not.toThrow();
    });
});
