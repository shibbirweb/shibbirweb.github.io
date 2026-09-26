import { describe, expect, it, vi } from 'vitest';
import {
    ACTIVITY_CELL_CORNER,
    ACTIVITY_CELL_FILL,
    ACTIVITY_CELL_PITCH,
    ACTIVITY_LEVEL_COUNT,
} from '@/components/layout/Footer/SignatureSpotlight/activityField';
import {
    SHADES_PER_LEVEL,
    shadeIndexFor,
} from '@/components/layout/Footer/SignatureSpotlight/activityColors';
import {
    drawActivityGraph,
    drawChangedSquares,
    readShadeColors,
} from '@/components/layout/Footer/SignatureSpotlight/drawActivityGraph';

const LEVEL_COLORS = ['#eeeeee', '#bbbbbb', '#888888', '#555555', '#222222'];

function canvasWithLevelColors(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    LEVEL_COLORS.forEach((color, level) =>
        canvas.style.setProperty(`--activity-level-${level}`, color)
    );
    document.body.append(canvas);
    return canvas;
}

/** A 2D context stand-in that records what was painted, and in what colour. */
function fakeContext() {
    const fills: { color: string; squares: number[][] }[] = [];
    const clipRects: number[][] = [];
    let path: number[][] = [];
    const context = {
        fillStyle: '',
        save: vi.fn(),
        restore: vi.fn(),
        rect: vi.fn((...box: number[]) => {
            clipRects.push(box);
        }),
        clip: vi.fn(),
        setTransform: vi.fn(),
        clearRect: vi.fn(),
        beginPath: vi.fn(() => {
            path = [];
        }),
        roundRect: vi.fn((...square: number[]) => {
            path.push(square);
        }),
        fill: vi.fn(() => {
            fills.push({ color: String(context.fillStyle), squares: path });
        }),
    };
    return {
        context: context as unknown as CanvasRenderingContext2D,
        fakeContext: context,
        fills,
        clipRects,
    };
}

describe('readShadeColors', () => {
    it('reads the level colours from the canvas and adds every in-between shade', () => {
        const shades = readShadeColors(canvasWithLevelColors());

        expect(shades).toHaveLength(
            (ACTIVITY_LEVEL_COUNT - 1) * SHADES_PER_LEVEL + 1
        );
        LEVEL_COLORS.forEach((color, level) => {
            expect(shades[level * SHADES_PER_LEVEL]).toBe(color);
        });
    });
});

describe('drawActivityGraph', () => {
    const shadeColors = readShadeColors(canvasWithLevelColors());
    const cells = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 0 },
        { x: 30, y: 4 },
    ];

    function draw(levels: number[], width = 200, height = 40) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const { context, fills } = fakeContext();
        drawActivityGraph(canvas, context, cells, levels, shadeColors, 100, 20);
        return { context, fills };
    }

    it('stretches the viewBox over the canvas and clears it first', () => {
        const { context } = draw([0, 0, 0, 0], 300, 60);

        expect(context.setTransform).toHaveBeenCalledWith(3, 0, 0, 3, 0, 0);
        expect(context.clearRect).toHaveBeenCalledWith(0, 0, 100, 20);
    });

    it('fills each shade once, with every square of that shade', () => {
        const { fills } = draw([4, 1, 4, 1]);

        expect(fills.map((fill) => fill.color)).toEqual([
            LEVEL_COLORS[1],
            LEVEL_COLORS[4],
        ]);
        expect(fills[0].squares).toHaveLength(2);
        expect(fills[1].squares).toHaveLength(2);
    });

    it('draws a fractional level in its in-between shade', () => {
        const { fills } = draw([2.5, 2.5, 2.5, 2.5]);

        expect(fills).toHaveLength(1);
        expect(fills[0].color).toBe(shadeColors[shadeIndexFor(2.5)]);
        expect(fills[0].color).not.toBe(LEVEL_COLORS[2]);
    });

    it('centres a rounded square of the right size in each cell', () => {
        const { fills } = draw([3, 3, 3, 3]);
        const size = ACTIVITY_CELL_PITCH * ACTIVITY_CELL_FILL;
        const inset = (ACTIVITY_CELL_PITCH - size) / 2;

        const [x, y, width, height, radius] = fills[0].squares[3];
        expect(x).toBeCloseTo(30 + inset);
        expect(y).toBeCloseTo(4 + inset);
        expect(width).toBeCloseTo(size);
        expect(height).toBeCloseTo(size);
        expect(radius).toBeCloseTo(size * ACTIVITY_CELL_CORNER);
    });

    it('draws every cell exactly once', () => {
        const { fills } = draw([0, 1.5, 3, 4]);
        const squareCount = fills.reduce(
            (total, fill) => total + fill.squares.length,
            0
        );

        expect(squareCount).toBe(cells.length);
    });
});

describe('drawChangedSquares', () => {
    const shadeColors = readShadeColors(canvasWithLevelColors());
    // Four cells in a row, each the neighbour of the next.
    const cells = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 4, y: 0 },
        { x: 6, y: 0 },
    ];
    const neighbours = [[1], [0, 2], [1, 3], [2]];

    // By default a 200 x 40 canvas over a 100 x 20 viewBox: 2 device pixels
    // per unit.
    function drawChanged(
        changedIndices: number[],
        levels: number[],
        pixelsPerUnit = 2
    ) {
        const canvas = document.createElement('canvas');
        canvas.width = 100 * pixelsPerUnit;
        canvas.height = 20 * pixelsPerUnit;
        const { context, fakeContext: raw, fills, clipRects } = fakeContext();
        drawChangedSquares(
            canvas,
            context,
            cells,
            neighbours,
            changedIndices,
            levels,
            shadeColors,
            100,
            20
        );
        return { raw, fills, clipRects };
    }

    it("clips to each changed square's footprint, rounded out to whole pixels", () => {
        const { clipRects, raw } = drawChanged([1], [0, 2, 4, 1]);
        const size = ACTIVITY_CELL_PITCH * ACTIVITY_CELL_FILL;
        const inset = (ACTIVITY_CELL_PITCH - size) / 2;
        const left = Math.floor((2 + inset) * 2);
        const right = Math.ceil((2 + inset + size) * 2);

        expect(clipRects).toHaveLength(1);
        expect(clipRects[0][0]).toBe(left);
        expect(clipRects[0][2]).toBe(right - left);
        clipRects[0].forEach((value) =>
            expect(Number.isInteger(value)).toBe(true)
        );
        expect(raw.clip).toHaveBeenCalledTimes(1);
    });

    it('clears inside the clip and restores the canvas state afterwards', () => {
        const { raw } = drawChanged([1, 3], [0, 2, 4, 1]);

        expect(raw.save).toHaveBeenCalledTimes(1);
        expect(raw.clearRect).toHaveBeenCalledTimes(1);
        expect(raw.clip.mock.invocationCallOrder[0]).toBeLessThan(
            raw.clearRect.mock.invocationCallOrder[0]
        );
        expect(raw.restore).toHaveBeenCalledTimes(1);
    });

    function squaresFilled(fills: { squares: number[][] }[]) {
        return fills.reduce((total, fill) => total + fill.squares.length, 0);
    }

    it('refills just the changed square when no neighbour shares its pixels', () => {
        // At 2 pixels per unit each square's edge pixels are its own.
        const { fills } = drawChanged([1], [0, 2, 4, 1], 2);

        expect(squaresFilled(fills)).toBe(1);
        expect(fills.map((fill) => fill.color)).toEqual([LEVEL_COLORS[2]]);
    });

    it('also refills a neighbour whose edge falls in the same pixels', () => {
        // At 1.2 pixels per unit the gap is under a pixel: square 1 covers
        // pixels 2..4 and square 0 reaches into pixel 2, so square 0 is
        // repainted too; square 2 starts at pixel 5 and is left alone.
        const { fills } = drawChanged([1], [0, 2, 4, 1], 1.2);

        expect(squaresFilled(fills)).toBe(2);
        expect(fills.map((fill) => fill.color)).toEqual([
            LEVEL_COLORS[0],
            LEVEL_COLORS[2],
        ]);
    });

    it('fills in the same shade order as a full repaint', () => {
        const { fills } = drawChanged([0, 3], [4, 3, 0, 1]);
        const shadeOrder = fills.map((fill) => shadeColors.indexOf(fill.color));

        expect(shadeOrder).toEqual([...shadeOrder].sort((a, b) => a - b));
    });
});
