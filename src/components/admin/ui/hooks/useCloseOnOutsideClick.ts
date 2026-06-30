'use client';

import { useEffect, type RefObject } from 'react';

/** Invokes `onClose` on a pointer press outside `ref` while `active`. */
export function useCloseOnOutsideClick(
    active: boolean,
    ref: RefObject<HTMLElement | null>,
    onClose: () => void
) {
    useEffect(() => {
        if (!active) return;
        const handler = (event: PointerEvent) => {
            if (!ref.current?.contains(event.target as Node)) onClose();
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, [active, ref, onClose]);
}
