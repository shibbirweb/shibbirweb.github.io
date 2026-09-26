import { act, renderHook } from '@testing-library/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { usePanZoom } from '@/components/pages/articles/MermaidRenderer/hooks/usePanZoom';

/** An element with a fixed box, since jsdom has no layout engine. */
function sizedElement(width: number, height: number): HTMLDivElement {
    const element = document.createElement('div');
    Object.defineProperty(element, 'clientWidth', { value: width });
    Object.defineProperty(element, 'clientHeight', { value: height });
    Object.defineProperty(element, 'offsetWidth', { value: width });
    Object.defineProperty(element, 'offsetHeight', { value: height });
    return element;
}

function pointerEvent(
    pointerType: string,
    clientX: number,
    clientY: number
): ReactPointerEvent {
    return {
        pointerType,
        clientX,
        clientY,
        pointerId: 1,
        currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as ReactPointerEvent;
}

/** Renders the hook with a viewport and content of the given sizes attached. */
function renderPanZoom(
    viewportSize: [number, number],
    contentSize: [number, number],
    allowTouchPan = false
) {
    const rendered = renderHook(() =>
        usePanZoom({ enableWheel: false, allowTouchPan })
    );
    rendered.result.current.viewportRef.current = sizedElement(...viewportSize);
    rendered.result.current.contentRef.current = sizedElement(...contentSize);
    return rendered;
}

describe('usePanZoom', () => {
    it('starts unscaled at the origin', () => {
        const { result } = renderHook(() =>
            usePanZoom({ enableWheel: false, allowTouchPan: false })
        );

        expect(result.current.transform).toEqual({ scale: 1, x: 0, y: 0 });
    });

    it('zooms in around the viewport centre', () => {
        const { result } = renderPanZoom([400, 300], [400, 300]);

        act(() => result.current.zoomIn());

        expect(result.current.transform.scale).toBeCloseTo(1.3);
        expect(result.current.transform.x).toBeCloseTo(200 - 200 * 1.3);
        expect(result.current.transform.y).toBeCloseTo(150 - 150 * 1.3);
    });

    it('undoes a zoom in with a zoom out', () => {
        const { result } = renderPanZoom([400, 300], [400, 300]);

        act(() => result.current.zoomIn());
        act(() => result.current.zoomOut());

        expect(result.current.transform.scale).toBeCloseTo(1);
        expect(result.current.transform.x).toBeCloseTo(0);
        expect(result.current.transform.y).toBeCloseTo(0);
    });

    it('clamps zoom between 0.2 and 8', () => {
        const { result } = renderPanZoom([400, 300], [400, 300]);

        for (let i = 0; i < 20; i++) {
            act(() => result.current.zoomIn());
        }
        expect(result.current.transform.scale).toBe(8);

        for (let i = 0; i < 40; i++) {
            act(() => result.current.zoomOut());
        }
        expect(result.current.transform.scale).toBe(0.2);
    });

    it('does nothing on zoom before a viewport is attached', () => {
        const { result } = renderHook(() =>
            usePanZoom({ enableWheel: false, allowTouchPan: false })
        );

        act(() => result.current.zoomIn());

        expect(result.current.transform).toEqual({ scale: 1, x: 0, y: 0 });
    });

    it('fits wide content by scaling it down and centring it', () => {
        const { result } = renderPanZoom([400, 300], [800, 300]);

        act(() => result.current.fit());

        expect(result.current.transform).toEqual({ scale: 0.5, x: 0, y: 75 });
    });

    it('centres small content without upscaling it', () => {
        const { result } = renderPanZoom([400, 300], [100, 100]);

        act(() => result.current.fit());

        expect(result.current.transform).toEqual({ scale: 1, x: 150, y: 100 });
    });

    it('resets to the fitted view', () => {
        const { result } = renderPanZoom([400, 300], [800, 300]);

        act(() => result.current.zoomIn());
        act(() => result.current.reset());

        expect(result.current.transform).toEqual({ scale: 0.5, x: 0, y: 75 });
    });

    it('pans by a fixed offset', () => {
        const { result } = renderPanZoom([400, 300], [400, 300]);

        act(() => result.current.panBy(10, -5));
        act(() => result.current.panBy(10, -5));

        expect(result.current.transform).toEqual({ scale: 1, x: 20, y: -10 });
    });

    it('pans by the distance a mouse drags', () => {
        const { result } = renderPanZoom([400, 300], [400, 300]);

        act(() => result.current.onPointerDown(pointerEvent('mouse', 10, 10)));
        act(() => result.current.onPointerMove(pointerEvent('mouse', 30, 5)));
        act(() => result.current.onPointerMove(pointerEvent('mouse', 40, 5)));
        act(() => result.current.onPointerUp());
        act(() => result.current.onPointerMove(pointerEvent('mouse', 90, 90)));

        expect(result.current.transform).toEqual({ scale: 1, x: 30, y: -5 });
    });

    it('ignores touch drags unless touch panning is allowed', () => {
        const touchBlocked = renderPanZoom([400, 300], [400, 300], false);
        const touchAllowed = renderPanZoom([400, 300], [400, 300], true);

        for (const { result } of [touchBlocked, touchAllowed]) {
            act(() =>
                result.current.onPointerDown(pointerEvent('touch', 0, 0))
            );
            act(() =>
                result.current.onPointerMove(pointerEvent('touch', 25, 25))
            );
        }

        expect(touchBlocked.result.current.transform).toEqual({
            scale: 1,
            x: 0,
            y: 0,
        });
        expect(touchAllowed.result.current.transform).toEqual({
            scale: 1,
            x: 25,
            y: 25,
        });
    });
});
