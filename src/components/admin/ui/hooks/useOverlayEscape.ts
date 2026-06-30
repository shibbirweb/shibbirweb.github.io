'use client';

import { useEffect } from 'react';

// A shared stack of open overlays so Escape only closes the topmost one. With
// the details drawer open and an insert dialog on top, one Escape press should
// dismiss only the dialog, not both.
const stack: number[] = [];
let counter = 0;

/** Closes this overlay on Escape, but only while it is the topmost layer. */
export function useOverlayEscape(active: boolean, onClose: () => void) {
    useEffect(() => {
        if (!active) return;
        const id = ++counter;
        stack.push(id);
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && stack[stack.length - 1] === id) {
                onClose();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            const index = stack.indexOf(id);
            if (index >= 0) stack.splice(index, 1);
        };
    }, [active, onClose]);
}
