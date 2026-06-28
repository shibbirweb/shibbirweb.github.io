'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PanZoomTransform {
    scale: number;
    x: number;
    y: number;
}

interface PanZoomOptions {
    /** Zoom toward the cursor on wheel (used in the full-screen view). */
    enableWheel: boolean;
    /** Allow drag-panning with touch/pen, not just mouse. */
    allowTouchPan: boolean;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 8;

const clampScale = (scale: number) =>
    Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

/**
 * Pan and zoom for a fixed-size viewport over larger content, driven by CSS
 * transforms (origin top-left). Returns refs for the viewport and content, the
 * current transform, pointer handlers, and zoom/fit controls. Zoom keeps the
 * point under the cursor (or the viewport center, for the buttons) fixed.
 */
export function usePanZoom({ enableWheel, allowTouchPan }: PanZoomOptions) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState<PanZoomTransform>({
        scale: 1,
        x: 0,
        y: 0,
    });
    const dragOrigin = useRef<{ x: number; y: number } | null>(null);

    const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
        setTransform((prev) => {
            const scale = clampScale(prev.scale * factor);
            const ratio = scale / prev.scale;
            return {
                scale,
                x: cx - (cx - prev.x) * ratio,
                y: cy - (cy - prev.y) * ratio,
            };
        });
    }, []);

    /** Scale the content to fit the viewport (never upscaling) and center it. */
    const fit = useCallback(() => {
        const viewport = viewportRef.current;
        const content = contentRef.current;
        if (!viewport || !content) return;
        const vw = viewport.clientWidth;
        const vh = viewport.clientHeight;
        const cw = content.offsetWidth;
        const ch = content.offsetHeight;
        if (!cw || !ch) return;
        const scale = Math.min(vw / cw, vh / ch, 1);
        setTransform({
            scale,
            x: (vw - cw * scale) / 2,
            y: (vh - ch * scale) / 2,
        });
    }, []);

    const zoomFromCenter = useCallback(
        (factor: number) => {
            const viewport = viewportRef.current;
            if (!viewport) return;
            zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, factor);
        },
        [zoomAt]
    );

    const zoomIn = useCallback(() => zoomFromCenter(1.3), [zoomFromCenter]);
    const zoomOut = useCallback(() => zoomFromCenter(1 / 1.3), [zoomFromCenter]);

    const onPointerDown = useCallback(
        (event: React.PointerEvent) => {
            if (!allowTouchPan && event.pointerType !== 'mouse') return;
            dragOrigin.current = { x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        [allowTouchPan]
    );

    const onPointerMove = useCallback((event: React.PointerEvent) => {
        const origin = dragOrigin.current;
        if (!origin) return;
        const dx = event.clientX - origin.x;
        const dy = event.clientY - origin.y;
        dragOrigin.current = { x: event.clientX, y: event.clientY };
        setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    }, []);

    const onPointerUp = useCallback(() => {
        dragOrigin.current = null;
    }, []);

    /** Shift the view by a fixed amount (used for arrow-key panning). */
    const panBy = useCallback((dx: number, dy: number) => {
        setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    }, []);

    // Wheel needs a non-passive listener so preventDefault can stop page scroll.
    useEffect(() => {
        if (!enableWheel) return;
        const viewport = viewportRef.current;
        if (!viewport) return;
        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            const rect = viewport.getBoundingClientRect();
            zoomAt(
                event.clientX - rect.left,
                event.clientY - rect.top,
                event.deltaY < 0 ? 1.15 : 1 / 1.15
            );
        };
        viewport.addEventListener('wheel', onWheel, { passive: false });
        return () => viewport.removeEventListener('wheel', onWheel);
    }, [enableWheel, zoomAt]);

    return {
        viewportRef,
        contentRef,
        transform,
        fit,
        reset: fit,
        zoomIn,
        zoomOut,
        panBy,
        onPointerDown,
        onPointerMove,
        onPointerUp,
    };
}
