import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSpotlightSurfaces } from '@/components/pages/common/hooks/useSpotlightSurfaces';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';

function SpotlightHarness() {
    const groupRef = useRef<HTMLUListElement>(null);
    useSpotlightSurfaces(groupRef);

    return (
        <ul ref={groupRef}>
            <li
                {...spotlightSurfaceProps}
                data-testid="surface"
            >
                <span>Card body</span>
            </li>
            <li data-testid="gap">Not a surface</li>
        </ul>
    );
}

function stubPointer({
    finePointer,
    reducedMotion,
}: {
    finePointer: boolean;
    reducedMotion: boolean;
}) {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches:
            (query === '(hover: hover) and (pointer: fine)' && finePointer) ||
            (query === '(prefers-reduced-motion: reduce)' && reducedMotion),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    }));
}

describe('useSpotlightSurfaces', () => {
    let pendingFrames: FrameRequestCallback[] = [];

    function flushFrames() {
        const frames = pendingFrames;
        pendingFrames = [];
        act(() => {
            frames.forEach((callback) => callback(0));
        });
    }

    function getSurface() {
        const surface = screen.getByTestId('surface');
        surface.getBoundingClientRect = () =>
            ({ left: 100, top: 50 }) as DOMRect;
        return surface;
    }

    beforeEach(() => {
        pendingFrames = [];
        vi.stubGlobal(
            'requestAnimationFrame',
            (callback: FrameRequestCallback) => {
                pendingFrames.push(callback);
                return pendingFrames.length;
            }
        );
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('does nothing without a fine, hovering pointer', () => {
        stubPointer({ finePointer: false, reducedMotion: false });
        render(<SpotlightHarness />);
        const surface = getSurface();

        fireEvent.pointerMove(screen.getByText('Card body'), {
            clientX: 130,
            clientY: 70,
        });
        flushFrames();

        expect(surface.style.getPropertyValue('--pointer-x')).toBe('');
    });

    it('does nothing for reduced-motion visitors', () => {
        stubPointer({ finePointer: true, reducedMotion: true });
        render(<SpotlightHarness />);
        const surface = getSurface();

        fireEvent.pointerMove(screen.getByText('Card body'), {
            clientX: 130,
            clientY: 70,
        });
        flushFrames();

        expect(surface.style.getPropertyValue('--pointer-x')).toBe('');
    });

    it('writes the pointer position in surface and viewport coordinates', () => {
        stubPointer({ finePointer: true, reducedMotion: false });
        render(<SpotlightHarness />);
        const surface = getSurface();

        fireEvent.pointerMove(screen.getByText('Card body'), {
            clientX: 130,
            clientY: 70,
        });
        expect(surface.style.getPropertyValue('--pointer-x')).toBe('');
        flushFrames();

        expect(surface.style.getPropertyValue('--pointer-x')).toBe('30px');
        expect(surface.style.getPropertyValue('--pointer-y')).toBe('20px');
        expect(surface.style.getPropertyValue('--pointer-viewport-x')).toBe(
            '130px'
        );
        expect(surface.style.getPropertyValue('--pointer-viewport-y')).toBe(
            '70px'
        );
    });

    it('ignores movement over elements that are not surfaces', () => {
        stubPointer({ finePointer: true, reducedMotion: false });
        render(<SpotlightHarness />);

        fireEvent.pointerMove(screen.getByTestId('gap'), {
            clientX: 10,
            clientY: 10,
        });

        expect(pendingFrames).toHaveLength(0);
        expect(
            screen.getByTestId('gap').style.getPropertyValue('--pointer-x')
        ).toBe('');
    });

    it('paints the latest position once per frame', () => {
        stubPointer({ finePointer: true, reducedMotion: false });
        render(<SpotlightHarness />);
        const surface = getSurface();

        fireEvent.pointerMove(surface, { clientX: 110, clientY: 60 });
        fireEvent.pointerMove(surface, { clientX: 150, clientY: 90 });
        expect(pendingFrames).toHaveLength(1);
        flushFrames();

        expect(surface.style.getPropertyValue('--pointer-x')).toBe('50px');
        expect(surface.style.getPropertyValue('--pointer-y')).toBe('40px');
    });
});
