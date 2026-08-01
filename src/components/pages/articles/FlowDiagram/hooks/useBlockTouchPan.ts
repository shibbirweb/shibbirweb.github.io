'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Stops a touch drag inside the container from reaching React Flow's pan handler,
 * so the page scrolls instead.
 *
 * React Flow can restrict panning to given mouse buttons, but its event filter only
 * consults that list for `mousedown`; a `touchstart` still starts a pan. Blocking
 * the gesture in the capture phase gets ahead of d3-zoom's listener on the pane,
 * which is what leaves a thumb swipe scrolling the article rather than dragging a
 * diagram that fills most of a phone screen. Mouse dragging is untouched.
 *
 * Pass `false` where the diagram should take the gesture: full view has no page
 * behind it to scroll.
 */
export function useBlockTouchPan(
    containerRef: RefObject<HTMLElement | null>,
    isBlocked: boolean
): void {
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isBlocked) return;
        const swallowTouch = (event: TouchEvent) => event.stopPropagation();
        container.addEventListener('touchstart', swallowTouch, {
            capture: true,
        });
        return () =>
            container.removeEventListener('touchstart', swallowTouch, {
                capture: true,
            });
    }, [containerRef, isBlocked]);
}
