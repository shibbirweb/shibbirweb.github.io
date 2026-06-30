'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drives the resizable Split view: tracks the left pane's width percentage and
 * the pointer-drag listeners, clamped between `min` and `max`. Owns its own
 * listener lifecycle so the component stays free of inline side effects.
 */
export function useSplitDrag(initialPercent = 50, min = 30, max = 75) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [leftPercent, setLeftPercent] = useState(initialPercent);

    const startDrag = useCallback(() => {
        const onMove = (event: PointerEvent) => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const percent = ((event.clientX - rect.left) / rect.width) * 100;
            setLeftPercent(Math.min(max, Math.max(min, percent)));
        };
        const onUp = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
            document.body.style.userSelect = '';
        };
        document.body.style.userSelect = 'none';
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    }, [min, max]);

    useEffect(
        () => () => {
            document.body.style.userSelect = '';
        },
        []
    );

    return { containerRef, leftPercent, startDrag };
}
