import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecentlyChanged } from '@/components/layout/Navbar/hooks/useRecentlyChanged';

describe('useRecentlyChanged', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function renderTracker(initialValue: boolean) {
        return renderHook(({ value }) => useRecentlyChanged(value, 500), {
            initialProps: { value: initialValue },
        });
    }

    it('does not count the initial mount as a change', () => {
        const { result } = renderTracker(false);

        expect(result.current).toBe(false);
    });

    it('is true on the render that flips the value', () => {
        const { result, rerender } = renderTracker(false);

        rerender({ value: true });

        expect(result.current).toBe(true);
    });

    it('stays true for the duration, then settles back to false', () => {
        const { result, rerender } = renderTracker(false);

        rerender({ value: true });
        act(() => {
            vi.advanceTimersByTime(499);
        });
        expect(result.current).toBe(true);

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe(false);
    });

    it('ignores re-renders that keep the same value', () => {
        const { result, rerender } = renderTracker(false);

        rerender({ value: false });

        expect(result.current).toBe(false);
    });

    it('restarts the window on a second change', () => {
        const { result, rerender } = renderTracker(false);

        rerender({ value: true });
        act(() => {
            vi.advanceTimersByTime(400);
        });
        rerender({ value: false });
        act(() => {
            vi.advanceTimersByTime(400);
        });

        expect(result.current).toBe(true);
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(result.current).toBe(false);
    });
});
