import { fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCloseOnClickOutside } from '@/components/layout/Navbar/hooks/useCloseOnClickOutside';

describe('useCloseOnClickOutside', () => {
    let menu: HTMLDivElement;
    let menuChild: HTMLButtonElement;
    let outside: HTMLParagraphElement;

    beforeEach(() => {
        menu = document.createElement('div');
        menuChild = document.createElement('button');
        menu.appendChild(menuChild);
        outside = document.createElement('p');
        document.body.append(menu, outside);
    });

    afterEach(() => {
        menu.remove();
        outside.remove();
    });

    it('closes on a press outside the element while active', () => {
        const onClose = vi.fn();
        renderHook(() =>
            useCloseOnClickOutside({ current: menu }, true, onClose)
        );

        fireEvent.pointerDown(outside);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('ignores presses inside the element', () => {
        const onClose = vi.fn();
        renderHook(() =>
            useCloseOnClickOutside({ current: menu }, true, onClose)
        );

        fireEvent.pointerDown(menuChild);
        fireEvent.pointerDown(menu);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('does nothing while inactive', () => {
        const onClose = vi.fn();
        renderHook(() =>
            useCloseOnClickOutside({ current: menu }, false, onClose)
        );

        fireEvent.pointerDown(outside);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('does nothing when the ref is not attached', () => {
        const onClose = vi.fn();
        renderHook(() =>
            useCloseOnClickOutside({ current: null }, true, onClose)
        );

        fireEvent.pointerDown(outside);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('stops listening once it becomes inactive', () => {
        const onClose = vi.fn();
        const ref = { current: menu };
        const { rerender } = renderHook(
            ({ active }) => useCloseOnClickOutside(ref, active, onClose),
            { initialProps: { active: true } }
        );

        rerender({ active: false });
        fireEvent.pointerDown(outside);

        expect(onClose).not.toHaveBeenCalled();
    });
});
