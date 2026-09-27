import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    MAX_OPACITY,
    REACH_TOP,
    usePointerSpotlight,
} from '@/components/layout/Footer/SignatureSpotlight/hooks/usePointerSpotlight';

// The signature's box on screen: 500 x 100 at (100, 100).
const RECT = { left: 100, top: 100, right: 600, bottom: 200 };

let pendingFrames = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;
let frameTime = 0;

/** Runs the queued animation frame, `stepMs` after the previous one. */
function runFrame(stepMs = 16) {
    frameTime += stepMs;
    const frames = [...pendingFrames.values()];
    pendingFrames = new Map();
    frames.forEach((callback) => callback(frameTime));
}

/** Runs frames until the hook stops asking for more (or a safety limit). */
function runFramesUntilSettled(limit = 1000) {
    for (let i = 0; i < limit && pendingFrames.size > 0; i++) {
        runFrame();
    }
}

function stubMedia({
    canHover = true,
    reduceMotion = false,
}: {
    canHover?: boolean;
    reduceMotion?: boolean;
}) {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches:
            (query === '(hover: hover) and (pointer: fine)' && canHover) ||
            (query === '(prefers-reduced-motion: reduce)' && reduceMotion),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    }));
}

function movePointer(clientX: number, clientY: number) {
    window.dispatchEvent(new MouseEvent('pointermove', { clientX, clientY }));
}

function renderSpotlight() {
    const target = document.createElement('div');
    target.getBoundingClientRect = () =>
        ({
            ...RECT,
            x: RECT.left,
            y: RECT.top,
            width: RECT.right - RECT.left,
            height: RECT.bottom - RECT.top,
        }) as DOMRect;
    const hook = renderHook(() => usePointerSpotlight({ current: target }));
    const read = (name: string) => target.style.getPropertyValue(name);
    return {
        ...hook,
        opacity: () => parseFloat(read('--spotlight-opacity')),
        pointerX: () => read('--pointer-x'),
        pointerY: () => read('--pointer-y'),
    };
}

describe('usePointerSpotlight', () => {
    beforeEach(() => {
        pendingFrames = new Map();
        nextFrameId = 1;
        frameTime = 0;
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn((callback: FrameRequestCallback) => {
                const id = nextFrameId++;
                pendingFrames.set(id, callback);
                return id;
            })
        );
        vi.stubGlobal(
            'cancelAnimationFrame',
            vi.fn((id: number) => pendingFrames.delete(id))
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('does nothing on touch and other hoverless devices', () => {
        stubMedia({ canHover: false });
        const spotlight = renderSpotlight();

        movePointer(300, 150);

        expect(requestAnimationFrame).not.toHaveBeenCalled();
        expect(spotlight.pointerX()).toBe('');
    });

    it('brightens gradually over the letters instead of jumping', () => {
        stubMedia({});
        const spotlight = renderSpotlight();

        movePointer(300, 150);
        runFrame();
        const firstFrame = spotlight.opacity();
        expect(firstFrame).toBeGreaterThan(0);
        expect(firstFrame).toBeLessThan(MAX_OPACITY * 0.2);

        runFrame(200);
        expect(spotlight.opacity()).toBeGreaterThan(firstFrame);
        expect(spotlight.opacity()).toBeLessThan(MAX_OPACITY);

        runFramesUntilSettled();
        expect(spotlight.opacity()).toBeCloseTo(MAX_OPACITY, 5);
        expect(pendingFrames.size).toBe(0);
    });

    it('puts the circle straight on the pointer while the spotlight is dark', () => {
        stubMedia({});
        const spotlight = renderSpotlight();

        movePointer(300, 150);
        runFrame();

        expect(spotlight.pointerX()).toBe('200px');
        expect(spotlight.pointerY()).toBe('50px');
    });

    it('glides the lit circle after the pointer', () => {
        stubMedia({});
        const spotlight = renderSpotlight();
        movePointer(300, 150);
        runFramesUntilSettled();

        movePointer(400, 150);
        runFrame();
        const gliding = parseFloat(spotlight.pointerX());
        expect(gliding).toBeGreaterThan(200);
        expect(gliding).toBeLessThan(300);

        runFramesUntilSettled();
        expect(spotlight.pointerX()).toBe('300px');
    });

    it('wakes before the pointer reaches the letters', () => {
        stubMedia({});
        const spotlight = renderSpotlight();

        // Halfway through the reach above the signature.
        movePointer(300, RECT.top - REACH_TOP / 2);
        runFramesUntilSettled();

        expect(spotlight.opacity()).toBeCloseTo(MAX_OPACITY / 2, 5);
    });

    it('stays dark when the pointer is out of reach', () => {
        stubMedia({});
        const spotlight = renderSpotlight();

        movePointer(300, RECT.top - REACH_TOP - 10);
        runFramesUntilSettled();

        expect(spotlight.opacity()).toBe(0);
    });

    it('fades back out gently when the pointer leaves', () => {
        stubMedia({});
        const spotlight = renderSpotlight();
        movePointer(300, 150);
        runFramesUntilSettled();

        movePointer(300, 800);
        runFrame();
        expect(spotlight.opacity()).toBeGreaterThan(MAX_OPACITY * 0.8);

        runFramesUntilSettled();
        expect(spotlight.opacity()).toBe(0);
    });

    it('moves the circle straight to the pointer under reduced motion', () => {
        stubMedia({ reduceMotion: true });
        const spotlight = renderSpotlight();
        movePointer(300, 150);
        runFramesUntilSettled();

        movePointer(400, 150);
        runFrame();

        expect(spotlight.pointerX()).toBe('300px');
    });

    it('stops listening when unmounted', () => {
        stubMedia({});
        const spotlight = renderSpotlight();
        spotlight.unmount();

        movePointer(300, 150);

        expect(requestAnimationFrame).not.toHaveBeenCalled();
    });
});
