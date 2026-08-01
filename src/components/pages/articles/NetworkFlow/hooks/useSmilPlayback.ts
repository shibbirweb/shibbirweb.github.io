'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Drives the SMIL clock of one `<svg>` from a boolean. `pauseAnimations` freezes
 * every `<animateMotion>` inside the element at once and `unpauseAnimations`
 * resumes them from where they stopped, which is exactly the behaviour a pause
 * button wants and is far cheaper than re-rendering the packets.
 */
export function useSmilPlayback(
    svgRef: RefObject<SVGSVGElement | null>,
    isPlaying: boolean
): void {
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        if (isPlaying) {
            svg.unpauseAnimations();
        } else {
            svg.pauseAnimations();
        }
    }, [svgRef, isPlaying]);
}
