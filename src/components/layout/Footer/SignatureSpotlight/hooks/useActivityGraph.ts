import { RefObject, useEffect } from 'react';
import { startActivityGraph } from '@/components/layout/Footer/SignatureSpotlight/startActivityGraph';

// Build the graph a little before the footer scrolls into view: early enough
// that it is ready when the visitor arrives, late enough that it never adds to
// the page's own start-up work.
const PREPARE_MARGIN = '600px 0px';

/**
 * Runs the footer's GitHub activity graph (startActivityGraph) on `canvasRef`,
 * but only once the footer nears the viewport, so laying out and painting the
 * graph never competes with hydrating the page. `spotlightRef` is where
 * usePointerSpotlight writes the spotlight's position and brightness.
 */
export function useActivityGraph(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    spotlightRef: RefObject<HTMLElement | null>
) {
    useEffect(() => {
        const canvas = canvasRef.current;
        const spotlight = spotlightRef.current;
        if (!canvas || !spotlight) {
            return;
        }

        let stopGraph: (() => void) | null = null;
        const start = () => {
            stopGraph = startActivityGraph(canvas, spotlight);
        };
        if (typeof IntersectionObserver === 'undefined') {
            start();
            return () => stopGraph?.();
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) {
                    return;
                }
                observer.disconnect();
                start();
            },
            { rootMargin: PREPARE_MARGIN }
        );
        observer.observe(canvas);

        return () => {
            observer.disconnect();
            stopGraph?.();
        };
    }, [canvasRef, spotlightRef]);
}
