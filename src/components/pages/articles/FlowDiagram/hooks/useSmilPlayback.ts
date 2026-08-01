'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Drives the SMIL clock of every `<svg>` inside a container from a boolean.
 * `pauseAnimations` freezes an SVG's `<animateMotion>` where it stands and
 * `unpauseAnimations` resumes from the same point, which is exactly what a pause
 * button wants and far cheaper than re-rendering the packets.
 *
 * It takes a container rather than one `<svg>` because React Flow owns its own
 * markup and paints edges into an SVG layer it manages, so the element to freeze
 * is not one this component renders.
 */
export function useSmilPlayback(
    containerRef: RefObject<HTMLElement | null>,
    isRunning: boolean
): void {
    // Deliberately no dependency array. React Flow replaces its SVG layer as
    // scenarios change, and a freshly created SVG starts with its clock running,
    // so the state has to be reasserted after every render rather than only when
    // `isRunning` flips. The work is a querySelectorAll and a couple of calls.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        for (const canvas of container.querySelectorAll('svg')) {
            // Guarded because this runs against whatever SVG the container holds,
            // and the SMIL clock methods are not universally implemented (jsdom,
            // for one, has neither). A missing clock is not an error here.
            if (typeof canvas.pauseAnimations !== 'function') continue;
            if (isRunning) {
                canvas.unpauseAnimations();
            } else {
                canvas.pauseAnimations();
            }
        }
    });
}
