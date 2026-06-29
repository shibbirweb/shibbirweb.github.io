'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * The shared chrome behind the article overlays (Mermaid full view, image
 * lightbox): on mount it locks body scroll, moves focus to `initialFocusRef`,
 * and closes on Escape; on unmount it restores scroll and returns focus to
 * whatever was focused before. The effect runs once for the overlay's lifetime,
 * `onClose` is read through a ref so a fresh callback identity each render never
 * re-captures the previously focused element (which would break focus return).
 */
export function useModalChrome<T extends HTMLElement>(
    onClose: () => void,
    initialFocusRef?: RefObject<T | null>
): void {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        initialFocusRef?.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onCloseRef.current();
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [initialFocusRef]);
}
