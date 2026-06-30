'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Tracks a non-empty text selection inside the editor and returns its viewport
 * rectangle, so a floating formatting toolbar can be anchored above it. Returns
 * null whenever the selection is collapsed or outside the editor.
 */
export function useSelectionBubble(
    ref: RefObject<HTMLElement | null>
): DOMRect | null {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const onSelectionChange = () => {
            const root = ref.current;
            const selection = window.getSelection();
            if (
                !root ||
                !selection ||
                selection.isCollapsed ||
                selection.rangeCount === 0
            ) {
                setRect(null);
                return;
            }
            const range = selection.getRangeAt(0);
            if (!root.contains(range.commonAncestorContainer)) {
                setRect(null);
                return;
            }
            const bounds = range.getBoundingClientRect();
            setRect(bounds.width || bounds.height ? bounds : null);
        };
        document.addEventListener('selectionchange', onSelectionChange);
        return () =>
            document.removeEventListener('selectionchange', onSelectionChange);
    }, [ref]);

    return rect;
}
