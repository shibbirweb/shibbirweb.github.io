import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollY } from '@/components/layout/Navbar/hooks/useScrollY';

describe('useScrollY', () => {
    let pendingFrames: FrameRequestCallback[] = [];
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
        pendingFrames.push(callback);
        return pendingFrames.length;
    });

    function flushFrames() {
        const frames = pendingFrames;
        pendingFrames = [];
        act(() => {
            frames.forEach((callback) => callback(0));
        });
    }

    function scrollTo(position: number) {
        window.scrollY = position;
        window.dispatchEvent(new Event('scroll'));
    }

    beforeEach(() => {
        pendingFrames = [];
        requestFrame.mockClear();
        vi.stubGlobal('requestAnimationFrame', requestFrame);
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        window.scrollY = 0;
    });

    it('starts at the current scroll position', () => {
        window.scrollY = 120;

        const { result } = renderHook(() => useScrollY());

        expect(result.current).toBe(120);
    });

    it('updates on the next frame after a scroll', () => {
        const { result } = renderHook(() => useScrollY());

        scrollTo(300);
        expect(result.current).toBe(0);

        flushFrames();
        expect(result.current).toBe(300);
    });

    it('coalesces several scroll events into one frame', () => {
        const { result } = renderHook(() => useScrollY());

        scrollTo(100);
        scrollTo(200);
        scrollTo(250);

        expect(requestFrame).toHaveBeenCalledTimes(1);
        flushFrames();
        expect(result.current).toBe(250);
    });

    it('schedules a fresh frame once the previous one ran', () => {
        const { result } = renderHook(() => useScrollY());

        scrollTo(100);
        flushFrames();
        scrollTo(400);
        flushFrames();

        expect(result.current).toBe(400);
    });

    it('stops listening after unmount', () => {
        const { unmount } = renderHook(() => useScrollY());

        unmount();
        scrollTo(500);

        expect(requestFrame).not.toHaveBeenCalled();
    });
});
