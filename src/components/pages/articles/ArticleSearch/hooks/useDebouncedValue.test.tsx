import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from '@/components/pages/articles/ArticleSearch/hooks/useDebouncedValue';

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('useDebouncedValue', () => {
    it('returns the initial value immediately', () => {
        const { result } = renderHook(() => useDebouncedValue('first', 200));

        expect(result.current).toBe('first');
    });

    it('emits a new value only after the delay has passed', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 200),
            { initialProps: { value: 'a' } }
        );

        rerender({ value: 'ab' });
        act(() => {
            vi.advanceTimersByTime(199);
        });
        expect(result.current).toBe('a');

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe('ab');
    });

    it('restarts the window on every change, keeping only the last value', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 200),
            { initialProps: { value: 'd' } }
        );

        rerender({ value: 'do' });
        act(() => {
            vi.advanceTimersByTime(150);
        });
        rerender({ value: 'doc' });
        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(result.current).toBe('d');

        act(() => {
            vi.advanceTimersByTime(50);
        });
        expect(result.current).toBe('doc');
    });
});
