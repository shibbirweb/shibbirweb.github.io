import {
    ACTIVITY_CELL_CORNER,
    ACTIVITY_CELL_FILL,
    ACTIVITY_CELL_PITCH,
    ACTIVITY_LEVEL_COUNT,
    ActivityCell,
} from '@/components/layout/Footer/SignatureSpotlight/activityField';
import {
    buildShadeColors,
    shadeIndexFor,
} from '@/components/layout/Footer/SignatureSpotlight/activityColors';

/**
 * Reads the per-level square colours from the canvas's CSS custom properties
 * (--activity-level-0 .. 4) and expands them into every in-between shade. Call
 * it again after a theme switch; drawing reuses the result on every frame.
 */
export function readShadeColors(canvas: HTMLCanvasElement): string[] {
    const style = getComputedStyle(canvas);
    const levelColors = Array.from(
        { length: ACTIVITY_LEVEL_COUNT },
        (_, level) => style.getPropertyValue(`--activity-level-${level}`).trim()
    );
    return buildShadeColors(levelColors);
}

const SQUARE_SIZE = ACTIVITY_CELL_PITCH * ACTIVITY_CELL_FILL;
const CORNER_RADIUS = SQUARE_SIZE * ACTIVITY_CELL_CORNER;
// Half the gap on each side, so every square sits centred in its cell.
const SQUARE_INSET = (ACTIVITY_CELL_PITCH - SQUARE_SIZE) / 2;

/**
 * Cells are in viewBox units; this stretches that box over the canvas's
 * backing store, so the graph lines up with the solid wordmark at any width
 * and pixel ratio.
 */
function scaleToViewBox(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    viewBoxWidth: number,
    viewBoxHeight: number
) {
    context.setTransform(
        canvas.width / viewBoxWidth,
        0,
        0,
        canvas.height / viewBoxHeight,
        0,
        0
    );
}

/**
 * Fills the given cells as rounded squares, grouped by shade so each colour is
 * filled once.
 */
function fillSquares(
    context: CanvasRenderingContext2D,
    cells: readonly ActivityCell[],
    indices: Iterable<number>,
    displayedLevels: ArrayLike<number>,
    shadeColors: readonly string[]
) {
    const cellsByShade: ActivityCell[][] = shadeColors.map(() => []);
    for (const index of indices) {
        cellsByShade[shadeIndexFor(displayedLevels[index])]?.push(cells[index]);
    }
    cellsByShade.forEach((shadeCells, shade) => {
        if (shadeCells.length === 0) {
            return;
        }
        context.beginPath();
        for (const cell of shadeCells) {
            context.roundRect(
                cell.x + SQUARE_INSET,
                cell.y + SQUARE_INSET,
                SQUARE_SIZE,
                SQUARE_SIZE,
                CORNER_RADIUS
            );
        }
        context.fillStyle = shadeColors[shade];
        context.fill();
    });
}

function* allIndices(count: number) {
    for (let index = 0; index < count; index++) {
        yield index;
    }
}

/**
 * Paints every cell as a rounded square in the shade of its displayed level,
 * which may be fractional while a square fades between levels. Used for the
 * first paint, a resize and a theme switch; animation frames repaint only the
 * squares that changed (drawChangedSquares).
 */
export function drawActivityGraph(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    cells: readonly ActivityCell[],
    displayedLevels: ArrayLike<number>,
    shadeColors: readonly string[],
    viewBoxWidth: number,
    viewBoxHeight: number
) {
    scaleToViewBox(canvas, context, viewBoxWidth, viewBoxHeight);
    context.clearRect(0, 0, viewBoxWidth, viewBoxHeight);
    fillSquares(
        context,
        cells,
        allIndices(cells.length),
        displayedLevels,
        shadeColors
    );
}

type PixelBox = { left: number; top: number; right: number; bottom: number };

/**
 * The whole device pixels a cell's square touches, antialiased edge included.
 */
function squarePixels(
    cell: ActivityCell,
    scaleX: number,
    scaleY: number
): PixelBox {
    return {
        left: Math.floor((cell.x + SQUARE_INSET) * scaleX),
        top: Math.floor((cell.y + SQUARE_INSET) * scaleY),
        right: Math.ceil((cell.x + SQUARE_INSET + SQUARE_SIZE) * scaleX),
        bottom: Math.ceil((cell.y + SQUARE_INSET + SQUARE_SIZE) * scaleY),
    };
}

function boxesOverlap(first: PixelBox, second: PixelBox): boolean {
    return (
        first.left < second.right &&
        second.left < first.right &&
        first.top < second.bottom &&
        second.top < first.bottom
    );
}

/**
 * Repaints only the squares in `changedIndices`, pixel for pixel as a full
 * repaint would leave them. Each changed square's pixels (its footprint
 * rounded out to whole device pixels) are clipped to, so nothing outside is
 * touched and the clip has no soft edge. Inside the clip it clears, then
 * refills the changed squares plus any `neighbours` (from listCellNeighbours)
 * whose own pixels reach into the clip, which only happens where the gap
 * between squares is under a device pixel. It fills in the same shade order as
 * drawActivityGraph. While the graph breathes, far fewer squares change shade
 * per frame than exist, so this is much cheaper than a full repaint.
 */
export function drawChangedSquares(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    cells: readonly ActivityCell[],
    neighbours: readonly (readonly number[])[],
    changedIndices: readonly number[],
    displayedLevels: ArrayLike<number>,
    shadeColors: readonly string[],
    viewBoxWidth: number,
    viewBoxHeight: number
) {
    const scaleX = canvas.width / viewBoxWidth;
    const scaleY = canvas.height / viewBoxHeight;
    const repainted = new Set<number>();

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.beginPath();
    for (const index of changedIndices) {
        const box = squarePixels(cells[index], scaleX, scaleY);
        context.rect(
            box.left,
            box.top,
            box.right - box.left,
            box.bottom - box.top
        );
        repainted.add(index);
        for (const neighbour of neighbours[index] ?? []) {
            if (
                !repainted.has(neighbour) &&
                boxesOverlap(
                    box,
                    squarePixels(cells[neighbour], scaleX, scaleY)
                )
            ) {
                repainted.add(neighbour);
            }
        }
    }
    context.clip();
    context.clearRect(0, 0, canvas.width, canvas.height);
    scaleToViewBox(canvas, context, viewBoxWidth, viewBoxHeight);
    fillSquares(context, cells, repainted, displayedLevels, shadeColors);
    context.restore();
}
