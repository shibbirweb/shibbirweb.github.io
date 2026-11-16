import { RefObject, useEffect } from 'react';

type InsideRefs<T extends HTMLElement> =
    | RefObject<T | null>
    | ReadonlyArray<RefObject<HTMLElement | null>>;

/**
 * Invokes `onClose` when a pointer press lands outside `refs` while `active`.
 * Useful for dismissing menus/popovers by clicking or tapping elsewhere. The
 * listener is attached only while active, so the same press that opens the
 * menu cannot immediately close it.
 *
 * Pass several refs when one menu spans separate DOM subtrees (the mobile
 * menu's travelling wordmark sits outside the menu container): a press inside
 * any of them counts as inside, so it is not closed before its click lands.
 */
export function useCloseOnClickOutside<T extends HTMLElement>(
    refs: InsideRefs<T>,
    active: boolean,
    onClose: () => void
) {
    useEffect(() => {
        if (!active) {
            return;
        }
        const insideRefs = Array.isArray(refs) ? refs : [refs];
        const onPointerDown = (event: PointerEvent) => {
            const elements = insideRefs
                .map((ref) => ref.current)
                .filter((element) => element !== null);
            if (elements.length === 0) {
                return;
            }
            const pressedInside = elements.some((element) =>
                element.contains(event.target as Node)
            );
            if (!pressedInside) {
                onClose();
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [refs, active, onClose]);
}
