'use client';

import { RefObject, useEffect } from 'react';
import { spotlightSurfaceAttribute } from '@/components/pages/common/spotlightSurface';

/**
 * Follows the pointer across a group of spotlit surfaces so CSS can draw a
 * highlight under the cursor. Takes a ref to the group container; one delegated
 * pointermove listener there covers every surface inside it, however many there
 * are, instead of one listener per card. It takes the ref rather than creating one
 * so a container that already has a ref for something else (the About diagram's
 * draw-on-scroll) can share it. On each frame it resolves the surface under the
 * pointer and writes the position in that surface's own coordinates straight to
 * its inline style:
 *
 *   --pointer-x / --pointer-y  the highlight's centre, consumed by the radial
 *                              gradient and the border mask in the surface's own
 *                              CSS module.
 *   --pointer-viewport-x /     the same point in viewport coordinates, for a
 *   --pointer-viewport-y       surface whose lit parts are many separate elements
 *                              (an article table's cell grid lines). Those share one
 *                              coherent gradient by drawing it with
 *                              `background-attachment: fixed`, which resolves
 *                              against the viewport rather than each element's own
 *                              box, so every cell lights from the same centre.
 *
 * Delegating also keeps the surfaces themselves server components: only the thin
 * group wrapper is a client component, so cards and tiles (and the icon modules
 * they render) never enter the client bundle.
 *
 * Opacity is deliberately not written here: each module fades its spotlight layers
 * in on :hover, so they need no pointerenter/leave bookkeeping and cannot drift
 * out of step with the ambient accent bloom already on the surface. Reads are
 * throttled to one per animation frame and writes go straight to the DOM, so the
 * cursor path never re-renders React. No-ops on coarse / hoverless pointers and
 * for reduced-motion visitors, who keep the centred defaults from the module (the
 * global reduced-motion reset in globals.css only collapses transition and
 * animation durations, so it cannot stop a glow that JS moves).
 *
 * This is a deliberate sibling of usePointerSpotlight (the footer signature)
 * rather than a reuse of it: that hook's substance is its footer tuning, a
 * window-level listener plus REACH_* proximity math driving a JS-written
 * --spotlight-opacity, none of which these surfaces want.
 */
export function useSpotlightSurfaces(groupRef: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const group = groupRef.current;
        if (!group) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        let frame = 0;
        let surface: HTMLElement | null = null;
        let clientX = 0;
        let clientY = 0;

        const paint = () => {
            frame = 0;
            if (!surface) return;
            const rect = surface.getBoundingClientRect();
            surface.style.setProperty(
                '--pointer-x',
                `${clientX - rect.left}px`
            );
            surface.style.setProperty('--pointer-y', `${clientY - rect.top}px`);
            surface.style.setProperty('--pointer-viewport-x', `${clientX}px`);
            surface.style.setProperty('--pointer-viewport-y', `${clientY}px`);
        };

        const onPointerMove = (event: PointerEvent) => {
            const target = event.target as Element | null;
            const hovered =
                target?.closest<HTMLElement>(
                    `[${spotlightSurfaceAttribute}]`
                ) ?? null;
            // Over the gaps between surfaces there is nothing to light; leave the
            // last one as it was, since its hover state is already gone.
            if (!hovered) return;
            surface = hovered;
            clientX = event.clientX;
            clientY = event.clientY;
            if (frame) return;
            frame = requestAnimationFrame(paint);
        };

        group.addEventListener('pointermove', onPointerMove);
        return () => {
            group.removeEventListener('pointermove', onPointerMove);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [groupRef]);
}
