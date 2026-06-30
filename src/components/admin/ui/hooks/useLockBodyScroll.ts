'use client';

import { useEffect } from 'react';

/** Locks page scroll while `active` (for modals and the details drawer). */
export function useLockBodyScroll(active: boolean) {
    useEffect(() => {
        if (!active) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [active]);
}
