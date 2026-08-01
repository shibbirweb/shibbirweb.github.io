'use client';

import { useCallback, type KeyboardEvent } from 'react';

/** Pixels an arrow key, or one press of a control cluster's d-pad, shifts a view. */
export const PAN_STEP = 48;

interface DiagramViewportActions {
    /** Shift the view by (dx, dy) pixels. Positive dy reveals what is above. */
    panBy: (dx: number, dy: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    /** Back to the fitted view the diagram opened on. */
    reset: () => void;
}

/**
 * Keyboard control for a pannable diagram: arrows pan, `+`/`-` zoom, `0` refits.
 *
 * Shared by both renderings. The mermaid stage moves a CSS transform and the React
 * Flow canvas moves its own viewport, so the actions differ entirely, but the key
 * table must not: a reader who learns the keys on one diagram should find them on
 * the other. Holding the table in one place is what makes that true, rather than
 * two copies and a comment hoping they stay in step.
 *
 * Returns the handler to spread onto a focusable viewport. Only the keys listed
 * are claimed; anything else falls through untouched, so Tab and browser
 * shortcuts keep working.
 */
export function useDiagramViewportKeys({
    panBy,
    zoomIn,
    zoomOut,
    reset,
}: DiagramViewportActions): (event: KeyboardEvent) => void {
    return useCallback(
        (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowUp':
                    panBy(0, PAN_STEP);
                    break;
                case 'ArrowDown':
                    panBy(0, -PAN_STEP);
                    break;
                case 'ArrowLeft':
                    panBy(PAN_STEP, 0);
                    break;
                case 'ArrowRight':
                    panBy(-PAN_STEP, 0);
                    break;
                case '+':
                case '=':
                    zoomIn();
                    break;
                case '-':
                case '_':
                    zoomOut();
                    break;
                case '0':
                    reset();
                    break;
                default:
                    return;
            }
            event.preventDefault();
        },
        [panBy, zoomIn, zoomOut, reset]
    );
}
