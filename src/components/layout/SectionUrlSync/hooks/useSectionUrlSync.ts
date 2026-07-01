'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
    isScrollSyncLocked,
    scrollSyncLockRemaining,
} from '@/components/layout/scrollSyncLock';

/**
 * Reflects the section currently in view (`activeId`) into the URL hash with
 * `replaceState`, so scrolling the home page keeps the address bar in sync
 * without flooding the history stack. The hero clears the hash back to the bare
 * path. Writes are deferred while a programmatic scroll is in flight (see
 * scrollSyncLock), so the hash is not rewritten to every section a glide passes,
 * then applied once the scroll settles.
 */
export function useSectionUrlSync(activeId: string | null, heroId: string) {
    const pathname = usePathname();

    useEffect(() => {
        if (activeId === null) return;

        let retryTimer = 0;
        const sync = () => {
            // A programmatic scroll owns the URL while it runs, so stand down,
            // but retry once the lock lifts instead of dropping the write;
            // otherwise the section the scroll settles on (e.g. the hero, which
            // clears the hash) is never reflected. Re-check on each retry in case
            // the lock was extended.
            if (isScrollSyncLocked()) {
                retryTimer = window.setTimeout(
                    sync,
                    scrollSyncLockRemaining() + 50
                );
                return;
            }
            const targetHash = activeId === heroId ? '' : `#${activeId}`;
            if (window.location.hash === targetHash) return;

            window.history.replaceState(
                window.history.state,
                '',
                `${pathname}${window.location.search}${targetHash}`
            );
        };

        sync();
        return () => window.clearTimeout(retryTimer);
    }, [activeId, heroId, pathname]);
}
