import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoadDelayElapsed } from '@/components/animations/DeferredAnimations/hooks/useLoadDelayElapsed';

function mockReadyState(readyState: DocumentReadyState) {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue(readyState);
}

describe('useLoadDelayElapsed', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('starts false', () => {
        mockReadyState('complete');
        const { result } = renderHook(() => useLoadDelayElapsed(5000));

        expect(result.current).toBe(false);
    });

    it('turns true once the delay passes after an already loaded page', () => {
        mockReadyState('complete');
        const { result } = renderHook(() => useLoadDelayElapsed(5000));

        act(() => {
            vi.advanceTimersByTime(4999);
        });
        expect(result.current).toBe(false);

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe(true);
    });

    it('waits for the load event before counting the delay', () => {
        mockReadyState('loading');
        const { result } = renderHook(() => useLoadDelayElapsed(5000));

        act(() => {
            vi.advanceTimersByTime(10000);
        });
        expect(result.current).toBe(false);

        act(() => {
            window.dispatchEvent(new Event('load'));
            vi.advanceTimersByTime(5000);
        });
        expect(result.current).toBe(true);
    });

    it('never fires after unmounting', () => {
        mockReadyState('loading');
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
        const { result, unmount } = renderHook(() => useLoadDelayElapsed(5000));

        act(() => {
            window.dispatchEvent(new Event('load'));
        });
        unmount();
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(result.current).toBe(false);
        expect(vi.getTimerCount()).toBe(0);
    });
});
