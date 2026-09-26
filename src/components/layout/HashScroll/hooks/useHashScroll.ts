'use client';

import { useEffect } from 'react';
import { lockScrollSync } from '@/components/layout/scrollSyncLock';

// How long to let web fonts settle the content above the target before gliding,
// so the section's final offset is known. Capped so the glide is never delayed
// noticeably even if fonts are slow.
const SETTLE_TIMEOUT_MS = 300;
// Upper bound on how long the glide may take before its landing is checked,
// for browsers without the `scrollend` event.
const GLIDE_CHECK_TIMEOUT_MS = 1500;
// How far from the target the page may stop and still count as arrived.
const LANDING_TOLERANCE_PX = 4;

/** The scroll position that brings `target` to the top, as far as the page allows. */
function landingScrollY(target: HTMLElement): number {
    const scrollMargin =
        parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const targetY =
        target.getBoundingClientRect().top + window.scrollY - scrollMargin;
    const maxScrollY =
        document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(targetY, maxScrollY));
}

/**
 * On a direct visit to a URL with a fragment (e.g. /#skills), glide smoothly to
 * that section instead of letting the browser snap to it.
 *
 * `scroll-behavior: smooth` on <html> makes the browser's own fragment scroll
 * unreliable: it can start before layout settles, get interrupted, and leave the
 * visitor short of the target. So we take over: snap to the top instantly (so the
 * move reads as a deliberate glide down rather than an abrupt jump), wait a beat
 * for fonts to settle the offset, then smooth-scroll to the section ourselves.
 * The section -> URL sync is held off for the duration so it does not rewrite the
 * hash to each section the glide passes through.
 */
export function useHashScroll() {
    useEffect(() => {
        const { hash } = window.location;
        if (hash.length < 2) return;

        const id = decodeURIComponent(hash.slice(1));
        if (!document.getElementById(id)) return;

        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        // Keep the URL sync quiet across the whole take-over (settle + glide).
        lockScrollSync(1500);

        // Snap to the top instantly, overriding the global smooth behavior, so
        // the glide has somewhere to travel from.
        const root = document.documentElement;
        const previousBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        root.style.scrollBehavior = previousBehavior;

        let cancelled = false;
        let settleTimer = 0;
        let glideCheckTimer = 0;

        // On a slow device the smooth glide can be cut short a few pixels in
        // (the browser's own fragment scroll is still settling), which left the
        // visitor at the top and let the URL sync drop the hash. Once the glide
        // ends, finish the trip instantly if it stopped short.
        const finishIfShort = () => {
            window.clearTimeout(glideCheckTimer);
            window.removeEventListener('scrollend', finishIfShort);
            const target = document.getElementById(id);
            if (cancelled || !target) {
                return;
            }
            const expectedY = landingScrollY(target);
            if (Math.abs(window.scrollY - expectedY) <= LANDING_TOLERANCE_PX) {
                return;
            }
            lockScrollSync(500);
            root.style.scrollBehavior = 'auto';
            window.scrollTo(0, expectedY);
            root.style.scrollBehavior = previousBehavior;
        };

        const glideToTarget = () => {
            if (cancelled) return;
            // Re-lock for the glide itself in case fonts settled slowly.
            lockScrollSync(1000);
            window.addEventListener('scrollend', finishIfShort);
            glideCheckTimer = window.setTimeout(
                finishIfShort,
                GLIDE_CHECK_TIMEOUT_MS
            );
            document.getElementById(id)?.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
            });
        };

        // Glide once fonts are ready, but never wait longer than the cap.
        const settle = new Promise<void>((resolve) => {
            settleTimer = window.setTimeout(resolve, SETTLE_TIMEOUT_MS);
        });
        Promise.race([document.fonts?.ready ?? Promise.resolve(), settle]).then(
            () => {
                if (cancelled) return;
                requestAnimationFrame(glideToTarget);
            }
        );

        return () => {
            cancelled = true;
            window.clearTimeout(settleTimer);
            window.clearTimeout(glideCheckTimer);
            window.removeEventListener('scrollend', finishIfShort);
        };
    }, []);
}
