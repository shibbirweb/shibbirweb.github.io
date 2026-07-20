'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * The shared chrome behind the article overlays (Mermaid full view, image
 * lightbox, article search): on mount it locks body scroll, moves focus to
 * `initialFocusRef`, closes on Escape, and (when `containerRef` is given) traps
 * Tab focus inside the dialog so keyboard users cannot reach the page behind the
 * scrim; on unmount it restores scroll and returns focus to whatever was focused
 * before. The effect runs once for the overlay's lifetime, `onClose` is read
 * through a ref so a fresh callback identity each render never re-captures the
 * previously focused element (which would break focus return).
 */
export function useModalChrome<T extends HTMLElement>(
    onClose: () => void,
    initialFocusRef?: RefObject<T | null>,
    containerRef?: RefObject<HTMLElement | null>
): void {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        initialFocusRef?.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCloseRef.current();
                return;
            }
            if (event.key !== 'Tab' || !containerRef?.current) return;

            const focusables = Array.from(
                containerRef.current.querySelectorAll<HTMLElement>(
                    FOCUSABLE_SELECTOR
                )
            ).filter((element) => element.offsetParent !== null);
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;

            if (!containerRef.current.contains(active as Node)) {
                event.preventDefault();
                first.focus();
            } else if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [initialFocusRef, containerRef]);
}
