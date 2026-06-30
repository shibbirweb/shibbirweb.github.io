'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Wires the WAI-ARIA menu-button keyboard pattern: focus the first item on
 * open, roving Arrow/Home/End movement, and Escape/Tab to close (returning
 * focus to the trigger). Returns the keydown handler for the menu panel.
 */
export function useMenuKeyboard(
    open: boolean,
    panelRef: RefObject<HTMLElement | null>,
    onClose: () => void
) {
    useEffect(() => {
        if (!open) return;
        panelRef.current
            ?.querySelector<HTMLElement>('[role="menuitem"]')
            ?.focus();
    }, [open, panelRef]);

    const items = () =>
        Array.from(
            panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
                []
        );

    const onKeyDown = (event: React.KeyboardEvent) => {
        const all = items();
        if (all.length === 0) return;
        const current = all.indexOf(document.activeElement as HTMLElement);
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                all[(current + 1) % all.length]?.focus();
                break;
            case 'ArrowUp':
                event.preventDefault();
                all[(current - 1 + all.length) % all.length]?.focus();
                break;
            case 'Home':
                event.preventDefault();
                all[0]?.focus();
                break;
            case 'End':
                event.preventDefault();
                all[all.length - 1]?.focus();
                break;
            case 'Escape':
            case 'Tab':
                onClose();
                break;
        }
    };

    return onKeyDown;
}
