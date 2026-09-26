import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDisclosure } from '@/components/layout/Navbar/hooks/useDisclosure';

describe('useDisclosure', () => {
    it('starts closed by default', () => {
        const { result } = renderHook(() => useDisclosure());

        expect(result.current.open).toBe(false);
    });

    it('honours an initial open state', () => {
        const { result } = renderHook(() => useDisclosure(true));

        expect(result.current.open).toBe(true);
    });

    it('opens with show and closes with close', () => {
        const { result } = renderHook(() => useDisclosure());

        act(() => result.current.show());
        expect(result.current.open).toBe(true);

        act(() => result.current.close());
        expect(result.current.open).toBe(false);
    });

    it('flips the state with toggle', () => {
        const { result } = renderHook(() => useDisclosure());

        act(() => result.current.toggle());
        expect(result.current.open).toBe(true);

        act(() => result.current.toggle());
        expect(result.current.open).toBe(false);
    });

    it('keeps the callbacks stable across renders', () => {
        const { result, rerender } = renderHook(() => useDisclosure());
        const { close, show, toggle } = result.current;

        act(() => result.current.toggle());
        rerender();

        expect(result.current.close).toBe(close);
        expect(result.current.show).toBe(show);
        expect(result.current.toggle).toBe(toggle);
    });
});
