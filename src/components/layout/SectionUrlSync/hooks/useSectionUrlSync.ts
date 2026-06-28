'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isScrollSyncLocked } from '@/components/layout/scrollSyncLock';

/**
 * Reflects the section currently in view (`activeId`) into the URL hash with
 * `replaceState`, so scrolling the home page keeps the address bar in sync
 * without flooding the history stack. The hero clears the hash back to the bare
 * path. Writes are skipped while a programmatic scroll is in flight (see
 * scrollSyncLock), so the hash is not rewritten to every section a glide passes.
 */
export function useSectionUrlSync(activeId: string | null, heroId: string) {
    const pathname = usePathname();

    useEffect(() => {
        if (activeId === null || isScrollSyncLocked()) return;

        const targetHash = activeId === heroId ? '' : `#${activeId}`;
        if (window.location.hash === targetHash) return;

        window.history.replaceState(
            window.history.state,
            '',
            `${pathname}${window.location.search}${targetHash}`
        );
    }, [activeId, heroId, pathname]);
}
