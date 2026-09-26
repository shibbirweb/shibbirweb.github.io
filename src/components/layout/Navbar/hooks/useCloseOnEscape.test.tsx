import { fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCloseOnEscape } from '@/components/layout/Navbar/hooks/useCloseOnEscape';

describe('useCloseOnEscape', () => {
    it('closes on Escape while active', () => {
        const onClose = vi.fn();
        renderHook(() => useCloseOnEscape(true, onClose));

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('ignores other keys', () => {
        const onClose = vi.fn();
        renderHook(() => useCloseOnEscape(true, onClose));

        fireEvent.keyDown(document, { key: 'Enter' });

        expect(onClose).not.toHaveBeenCalled();
    });

    it('does nothing while inactive', () => {
        const onClose = vi.fn();
        renderHook(() => useCloseOnEscape(false, onClose));

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).not.toHaveBeenCalled();
    });

    it('stops listening once it becomes inactive', () => {
        const onClose = vi.fn();
        const { rerender } = renderHook(
            ({ active }) => useCloseOnEscape(active, onClose),
            { initialProps: { active: true } }
        );

        rerender({ active: false });
        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).not.toHaveBeenCalled();
    });

    it('stops listening after unmount', () => {
        const onClose = vi.fn();
        const { unmount } = renderHook(() => useCloseOnEscape(true, onClose));

        unmount();
        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onClose).not.toHaveBeenCalled();
    });
});
