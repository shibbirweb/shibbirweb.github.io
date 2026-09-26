import { RefObject, useEffect } from 'react';
import { easeToward } from '@/utils/easeToward';

// How far, in pixels, the glow reaches past the glyphs before it fully fades.
// The signature sits at the page edge, so it reaches farther above and to the
// sides than below.
const REACH_TOP = 72;
const REACH_SIDE = 56;
const REACH_BOTTOM = 28;
// Peak opacity of the contribution-graph reveal, reached when the pointer is
// over the glyphs; the solid base fades by the same amount, so the squares read
// in their true colours with only a trace of the letter behind them.
const MAX_OPACITY = 0.9;
// Time constants of the eases that let the spotlight trail the pointer instead
// of snapping to it: a short glide for the circle, a slower swell and fade for
// its brightness, so the graph brightens and settles calmly.
const POSITION_EASE_MS = 120;
const OPACITY_EASE_MS = 380;
// Close enough to stop animating and settle on the target.
const POSITION_SETTLE_PX = 0.5;
const OPACITY_SETTLE = 0.002;
// Cap on one frame's elapsed time, so a backgrounded tab does not jump.
const MAX_FRAME_MS = 100;

/**
 * Lights the footer signature as the pointer approaches it, not only when the
 * pointer is directly over the glyphs. A window-level pointermove listener
 * (throttled to one read per animation frame) measures the pointer against
 * `targetRef` (the signature's box) and writes three custom properties to it:
 *
 *   --pointer-x / --pointer-y  the spotlight circle's centre, in the glyph
 *                              box's own coordinates, so the mask stays aligned
 *                              even when the pointer sits outside the letters.
 *   --spotlight-opacity        how lit the reveal layer is: full over the
 *                              glyphs, fading to zero across a proximity margin
 *                              (REACH_*) that stretches farther above and to the
 *                              sides than below.
 *
 * Driving opacity from measured proximity, rather than the element's own :hover
 * box, is what lets the glow wake before the pointer reaches the letters, and
 * keeps the signature's own size and position untouched. Writes go straight to
 * the DOM, so the cursor path never re-renders React. The written values ease
 * toward the pointer over a few frames rather than snapping, and the frame loop
 * stops once they settle. Reduced motion keeps the brightness fade but moves the
 * circle straight to the pointer. No-ops on coarse / hoverless pointers, so
 * touch devices never attach a listener.
 */
export function usePointerSpotlight(
    targetRef: RefObject<SVGSVGElement | HTMLElement | null>
) {
    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return;
        }

        const positionEaseMs = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches
            ? 0
            : POSITION_EASE_MS;

        let frame = 0;
        let lastFrameTime = 0;
        let clientX = 0;
        let clientY = 0;
        // What is currently written to the element, easing toward the pointer.
        let shownX = 0;
        let shownY = 0;
        let shownOpacity = 0;

        const paint = (time: number) => {
            const elapsedMs = lastFrameTime
                ? Math.min(time - lastFrameTime, MAX_FRAME_MS)
                : 16;
            lastFrameTime = time;
            const rect = target.getBoundingClientRect();

            // How far the pointer sits outside the glyph box on each axis, each
            // normalised by that side's reach, then combined into one radial
            // falloff: 0 while over the glyphs, 1 at the edge of reach, beyond 1
            // once out of range.
            const outsideX =
                Math.max(rect.left - clientX, 0, clientX - rect.right) /
                REACH_SIDE;
            const outsideY =
                clientY < rect.top
                    ? (rect.top - clientY) / REACH_TOP
                    : Math.max(clientY - rect.bottom, 0) / REACH_BOTTOM;
            const distance = Math.hypot(outsideX, outsideY);
            const targetOpacity = Math.max(0, 1 - distance) * MAX_OPACITY;
            const targetX = clientX - rect.left;
            const targetY = clientY - rect.top;

            // While the spotlight is dark, jump the circle to the pointer so it
            // never visibly slides in from wherever it was last.
            const circleEaseMs =
                shownOpacity < OPACITY_SETTLE ? 0 : positionEaseMs;
            shownX = easeToward(shownX, targetX, elapsedMs, circleEaseMs);
            shownY = easeToward(shownY, targetY, elapsedMs, circleEaseMs);
            shownOpacity = easeToward(
                shownOpacity,
                targetOpacity,
                elapsedMs,
                OPACITY_EASE_MS
            );

            const settled =
                Math.abs(shownX - targetX) < POSITION_SETTLE_PX &&
                Math.abs(shownY - targetY) < POSITION_SETTLE_PX &&
                Math.abs(shownOpacity - targetOpacity) < OPACITY_SETTLE;
            if (settled) {
                shownX = targetX;
                shownY = targetY;
                shownOpacity = targetOpacity;
            }

            target.style.setProperty('--pointer-x', `${shownX}px`);
            target.style.setProperty('--pointer-y', `${shownY}px`);
            target.style.setProperty('--spotlight-opacity', `${shownOpacity}`);

            if (settled) {
                frame = 0;
                lastFrameTime = 0;
                return;
            }
            frame = requestAnimationFrame(paint);
        };

        const onPointerMove = (event: PointerEvent) => {
            clientX = event.clientX;
            clientY = event.clientY;
            if (frame) return;
            frame = requestAnimationFrame(paint);
        };

        window.addEventListener('pointermove', onPointerMove);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [targetRef]);
}
