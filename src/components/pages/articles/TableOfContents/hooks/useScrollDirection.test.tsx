import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollDirection } from '@/components/pages/articles/TableOfContents/hooks/useScrollDirection';

function scrollTo(y: number) {
    act(() => {
        Object.defineProperty(window, 'scrollY', {
            value: y,
            configurable: true,
        });
        window.dispatchEvent(new Event('scroll'));
    });
}

beforeEach(() => {
    // Run animation frames immediately so each scroll updates synchronously.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        callback(0);
        return 0;
    });
    scrollTo(0);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useScrollDirection', () => {
    it('starts in reading order', () => {
        const { result } = renderHook(() => useScrollDirection());

        expect(result.current).toBe('down');
    });

    it('follows the reader up and back down', () => {
        const { result } = renderHook(() => useScrollDirection());

        scrollTo(500);
        expect(result.current).toBe('down');

        scrollTo(300);
        expect(result.current).toBe('up');

        scrollTo(400);
        expect(result.current).toBe('down');
    });

    it('ignores jitter smaller than a few pixels', () => {
        const { result } = renderHook(() => useScrollDirection());

        scrollTo(500);
        scrollTo(498);

        expect(result.current).toBe('down');
    });
});
