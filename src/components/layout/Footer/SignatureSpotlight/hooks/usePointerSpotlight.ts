import { RefObject, useEffect } from 'react';

/**
 * Tracks the pointer inside `containerRef` and writes its position to the
 * --pointer-x / --pointer-y custom properties on that element, throttled to one
 * write per animation frame. Writing straight to the DOM keeps the cursor path
 * off React's render path. No-ops on coarse / hoverless pointers, so touch
 * devices never attach a listener.
 */
export function usePointerSpotlight(
    containerRef: RefObject<HTMLElement | null>
) {
    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return;
        }

        let frame = 0;
        let clientX = 0;
        let clientY = 0;

        const onPointerMove = (event: PointerEvent) => {
            clientX = event.clientX;
            clientY = event.clientY;
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                const rect = element.getBoundingClientRect();
                element.style.setProperty('--pointer-x', `${clientX - rect.left}px`);
                element.style.setProperty('--pointer-y', `${clientY - rect.top}px`);
            });
        };

        element.addEventListener('pointermove', onPointerMove);
        return () => {
            element.removeEventListener('pointermove', onPointerMove);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [containerRef]);
}
