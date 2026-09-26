import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollSpy } from '@/components/layout/Navbar/hooks/useScrollSpy';

const sectionIds = ['about', 'skills', 'work'];

describe('useScrollSpy', () => {
    let pendingFrames: FrameRequestCallback[] = [];
    const sectionTops = new Map<string, number>();

    function flushFrames() {
        const frames = pendingFrames;
        pendingFrames = [];
        act(() => {
            frames.forEach((callback) => callback(0));
        });
    }

    function addSection(id: string, top: number) {
        const section = document.createElement('section');
        section.id = id;
        sectionTops.set(id, top);
        section.getBoundingClientRect = () =>
            ({ top: sectionTops.get(id) ?? 0 }) as DOMRect;
        document.body.appendChild(section);
    }

    function setPageHeight(height: number) {
        Object.defineProperty(document.documentElement, 'scrollHeight', {
            configurable: true,
            value: height,
        });
    }

    beforeEach(() => {
        pendingFrames = [];
        sectionTops.clear();
        vi.stubGlobal(
            'requestAnimationFrame',
            (callback: FrameRequestCallback) => {
                pendingFrames.push(callback);
                return pendingFrames.length;
            }
        );
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        window.innerHeight = 1000;
        window.scrollY = 0;
        setPageHeight(10_000);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        document.body.innerHTML = '';
        window.scrollY = 0;
        setPageHeight(0);
    });

    it('returns null when disabled', () => {
        addSection('about', 0);

        const { result } = renderHook(() => useScrollSpy(sectionIds, false));

        expect(result.current).toBeNull();
    });

    it('returns null when none of the sections exist', () => {
        const { result } = renderHook(() => useScrollSpy(sectionIds));

        expect(result.current).toBeNull();
    });

    it('returns null before the first section reaches the line', () => {
        addSection('about', 900);
        addSection('skills', 1800);

        const { result } = renderHook(() => useScrollSpy(sectionIds));

        expect(result.current).toBeNull();
    });

    it('picks the last section whose top crossed 30% of the viewport', () => {
        addSection('about', -400);
        addSection('skills', 300);
        addSection('work', 900);

        const { result } = renderHook(() => useScrollSpy(sectionIds));

        expect(result.current).toBe('skills');
    });

    it('updates on the next frame after a scroll', () => {
        addSection('about', 100);
        addSection('skills', 800);
        const { result } = renderHook(() => useScrollSpy(sectionIds));
        expect(result.current).toBe('about');

        sectionTops.set('skills', 200);
        window.dispatchEvent(new Event('scroll'));
        expect(result.current).toBe('about');

        flushFrames();
        expect(result.current).toBe('skills');
    });

    it('re-measures on resize', () => {
        addSection('about', 500);
        const { result } = renderHook(() => useScrollSpy(sectionIds));
        expect(result.current).toBeNull();

        window.innerHeight = 2000;
        window.dispatchEvent(new Event('resize'));
        flushFrames();

        expect(result.current).toBe('about');
    });

    it('keeps the last section lit at the bottom of the page', () => {
        addSection('about', -900);
        addSection('work', 850);
        setPageHeight(3000);
        window.scrollY = 2000;

        const { result } = renderHook(() => useScrollSpy(sectionIds));

        expect(result.current).toBe('work');
    });

    it('resets to null when it is disabled later', () => {
        addSection('about', 0);
        const { result, rerender } = renderHook(
            ({ enabled }) => useScrollSpy(sectionIds, enabled),
            { initialProps: { enabled: true } }
        );
        expect(result.current).toBe('about');

        rerender({ enabled: false });

        expect(result.current).toBeNull();
    });
});
