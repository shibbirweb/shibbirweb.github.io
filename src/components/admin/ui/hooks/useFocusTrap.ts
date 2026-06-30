'use client';

import { useEffect, type RefObject } from 'react';

const FOCUSABLE =
    'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab focus within `ref` while `active`, moves focus inside on open, and
 * restores it to the previously focused element on close, per the dialog
 * accessibility pattern.
 */
export function useFocusTrap(
    active: boolean,
    ref: RefObject<HTMLElement | null>
) {
    useEffect(() => {
        const root = ref.current;
        if (!active || !root) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;

        const focusable = () =>
            Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
                (element) => element.offsetParent !== null
            );

        (focusable()[0] ?? root).focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;
            const items = focusable();
            if (items.length === 0) {
                event.preventDefault();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        root.addEventListener('keydown', onKeyDown);
        return () => {
            root.removeEventListener('keydown', onKeyDown);
            previouslyFocused?.focus?.();
        };
    }, [active, ref]);
}
