import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activityGridLayout } from '@/components/layout/Footer/SignatureSpotlight/activityField';
import { createLetterMask } from '@/components/layout/Footer/SignatureSpotlight/letterMask';

// A 4 x 2 grid (pitch 10 over a 40 x 20 box), with these cells "painted".
const PAINTED_CELLS = new Set(['0,0', '3,1']);
const HALF_COVERED_CELL = '1,1';

/** A canvas stand-in whose 2D context records the paint and returns pixels. */
function fakeCanvas({ hasContext = true } = {}) {
    const context = {
        setTransform: vi.fn(),
        fill: vi.fn(),
        getImageData: vi.fn(
            (_x: number, _y: number, width: number, height: number) => {
                const data = new Uint8ClampedArray(width * height * 4);
                for (let row = 0; row < height; row++) {
                    for (let column = 0; column < width; column++) {
                        const key = `${column},${row}`;
                        let alpha = 0;
                        if (PAINTED_CELLS.has(key)) {
                            alpha = 255;
                        }
                        if (key === HALF_COVERED_CELL) {
                            alpha = 127;
                        }
                        data[(row * width + column) * 4 + 3] = alpha;
                    }
                }
                return { data };
            }
        ),
    };
    const canvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => (hasContext ? context : null)),
    } as unknown as HTMLCanvasElement;
    return { canvas, context };
}

describe('createLetterMask', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'Path2D',
            class {
                constructor(public pathData: string) {}
            }
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('sizes the mask to one pixel per grid cell', () => {
        const { canvas } = fakeCanvas();
        createLetterMask(40, 20, 'M 0 0', 10, () => canvas);

        expect(canvas.width).toBe(4);
        expect(canvas.height).toBe(2);
    });

    it('paints the letters once, with the even-odd rule, scaled to the grid', () => {
        const { canvas, context } = fakeCanvas();
        createLetterMask(45, 20, 'M 1 2', 10, () => canvas);
        const { offsetX, offsetY } = activityGridLayout(45, 20, 10);

        expect(context.setTransform).toHaveBeenCalledWith(
            0.1,
            0,
            0,
            0.1,
            -offsetX / 10,
            -offsetY / 10
        );
        expect(context.fill).toHaveBeenCalledTimes(1);
        expect(context.fill.mock.calls[0][1]).toBe('evenodd');
        expect(context.getImageData).toHaveBeenCalledTimes(1);
    });

    it('reports a cell as inside when its pixel is at least half covered', () => {
        const { canvas } = fakeCanvas();
        const isInside = createLetterMask(40, 20, 'M 0 0', 10, () => canvas);

        // Cell centres, in the box's own units.
        expect(isInside?.(5, 5)).toBe(true);
        expect(isInside?.(35, 15)).toBe(true);
        expect(isInside?.(15, 5)).toBe(false);
        expect(isInside?.(15, 15)).toBe(false);
    });

    it('treats points outside the grid as outside the letters', () => {
        const { canvas } = fakeCanvas();
        const isInside = createLetterMask(40, 20, 'M 0 0', 10, () => canvas);

        expect(isInside?.(-5, 5)).toBe(false);
        expect(isInside?.(45, 5)).toBe(false);
        expect(isInside?.(5, 25)).toBe(false);
    });

    it('returns null without a 2D context, so the caller can fall back', () => {
        const { canvas } = fakeCanvas({ hasContext: false });

        expect(createLetterMask(40, 20, 'M 0 0', 10, () => canvas)).toBeNull();
    });
});
