'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { useDisclosure } from '@/components/layout/Navbar/hooks/useDisclosure';
import { useCloseOnEscape } from '@/components/layout/Navbar/hooks/useCloseOnEscape';
import { useCloseOnClickOutside } from '@/components/layout/Navbar/hooks/useCloseOnClickOutside';
import { useCloseOnRouteChange } from '@/components/layout/Navbar/hooks/useCloseOnRouteChange';

/** Gap (px) between the trigger and the panel, matching the mt-2 / mb-2 offset. */
const PANEL_GAP = 8;

export type ShareMenuPlacement = 'top' | 'bottom';

/**
 * Behaviour for the article ShareMenu: open/close disclosure that dismisses on
 * Escape, on an outside click, and on navigation; the live page URL to share;
 * progressive detection of the Web Share API; and a vertical flip so the panel
 * opens where there is room.
 *
 * `pageUrl` is read from the browser (origin + pathname) after mount rather than
 * built from a hardcoded site URL, so the shared link always matches wherever the
 * page is actually served, and drops any transient hash/query. It starts empty to
 * match the server render and is set on the client, so there is no hydration
 * mismatch; the menu only opens on a click, by which point it is populated.
 *
 * `placement` is chosen the moment the menu opens, by comparing the space below
 * the trigger against the panel's measured height: it prefers opening downward
 * and flips up only when there is not enough room below and more room above
 * (e.g. the end-of-article button sitting near the bottom of the viewport).
 * Measuring in the open handler (never during render) keeps it out of the server
 * pass and commits the placement in the same update that opens the menu, so
 * there is no flicker.
 */
export function useShareMenu({
    menuRef,
    panelRef,
    title,
    description,
}: {
    menuRef: RefObject<HTMLDivElement | null>;
    panelRef: RefObject<HTMLDivElement | null>;
    title: string;
    description?: string;
}) {
    const { open, show, close } = useDisclosure();
    useCloseOnEscape(open, close);
    useCloseOnClickOutside(menuRef, open, close);
    useCloseOnRouteChange(close);

    const [placement, setPlacement] = useState<ShareMenuPlacement>('bottom');

    const toggle = useCallback(() => {
        if (open) {
            close();
            return;
        }
        const trigger = menuRef.current;
        const panel = panelRef.current;
        if (trigger && panel) {
            const triggerRect = trigger.getBoundingClientRect();
            const panelHeight = panel.offsetHeight;
            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;
            setPlacement(
                spaceBelow < panelHeight + PANEL_GAP && spaceAbove > spaceBelow
                    ? 'top'
                    : 'bottom'
            );
        }
        show();
    }, [open, show, close, menuRef, panelRef]);

    const [pageUrl, setPageUrl] = useState('');
    const [canNativeShare, setCanNativeShare] = useState(false);
    useEffect(() => {
        setPageUrl(`${window.location.origin}${window.location.pathname}`);
        setCanNativeShare(typeof navigator.share === 'function');
    }, []);

    const shareNative = useCallback(() => {
        void (async () => {
            try {
                await navigator.share({
                    title,
                    text: description,
                    url: pageUrl,
                });
            } catch {
                // The reader dismissed the share sheet, or it failed; no-op.
            }
        })();
    }, [title, description, pageUrl]);

    return {
        open,
        toggle,
        close,
        placement,
        pageUrl,
        canNativeShare,
        shareNative,
    };
}
