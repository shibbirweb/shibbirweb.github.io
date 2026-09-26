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
    let path: number[][] = [];
    const context = {
        fillStyle: '',
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
    return { context: context as unknown as CanvasRenderingContext2D, fills };
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
