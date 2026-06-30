'use client';

import { useEffect } from 'react';

/** Warn before a full-page unload (close, refresh) while edits are unsaved. */
export function useUnsavedGuard(active: boolean) {
    useEffect(() => {
        if (!active) return;
        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [active]);
}
