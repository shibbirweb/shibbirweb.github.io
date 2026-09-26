import {
    ACTIVITY_CELL_PITCH,
    activityGridLayout,
} from '@/components/layout/Footer/SignatureSpotlight/activityField';

// A cell counts as inside the letters when at least half of it is covered.
const COVERED_ALPHA = 128;

/**
 * Builds a fast "is this point inside the letters?" test for the graph grid.
 * Rather than hit-testing the path once per cell (thousands of isPointInPath
 * calls on every page load), it paints the letters once into a tiny
 * off-screen canvas with one pixel per grid cell and reads every pixel back in
 * a single getImageData call. A cell is inside when its pixel is at least half
 * covered. Returns null when no 2D context is available, so the caller can
 * fall back to isPointInPath.
 */
export function createLetterMask(
    width: number,
    height: number,
    pathData: string,
    pitch = ACTIVITY_CELL_PITCH,
    createCanvas: () => HTMLCanvasElement = () =>
        document.createElement('canvas')
): ((x: number, y: number) => boolean) | null {
    const { columns, rows, offsetX, offsetY } = activityGridLayout(
        width,
        height,
        pitch
    );
    const mask = createCanvas();
    mask.width = columns;
    mask.height = rows;
    const context = mask.getContext('2d', { willReadFrequently: true });
    if (!context || columns === 0 || rows === 0) {
        return null;
    }
    // One mask pixel per grid cell. The wordmark uses the even-odd rule, so
    // the holes in B, R, A and D stay empty.
    context.setTransform(
        1 / pitch,
        0,
        0,
        1 / pitch,
        -offsetX / pitch,
        -offsetY / pitch
    );
    context.fill(new Path2D(pathData), 'evenodd');
    const { data } = context.getImageData(0, 0, columns, rows);

    return (x, y) => {
        const column = Math.floor((x - offsetX) / pitch);
        const row = Math.floor((y - offsetY) / pitch);
        if (column < 0 || column >= columns || row < 0 || row >= rows) {
            return false;
        }
        return data[(row * columns + column) * 4 + 3] >= COVERED_ALPHA;
    };
}
