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

/**
 * Paints every cell as a rounded square in the shade of its displayed level,
 * which may be fractional while a square fades between levels. Cells are in
 * viewBox units; the transform stretches that box over the canvas's backing
 * store, so the graph lines up with the solid wordmark at any width and pixel
 * ratio. Squares are grouped by shade so each colour is filled once.
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
    const squareSize = ACTIVITY_CELL_PITCH * ACTIVITY_CELL_FILL;
    const cornerRadius = squareSize * ACTIVITY_CELL_CORNER;
    // Half the gap on each side, so every square sits centred in its cell.
    const inset = (ACTIVITY_CELL_PITCH - squareSize) / 2;

    const cellsByShade: ActivityCell[][] = shadeColors.map(() => []);
    cells.forEach((cell, index) => {
        cellsByShade[shadeIndexFor(displayedLevels[index])]?.push(cell);
    });

    context.setTransform(
        canvas.width / viewBoxWidth,
        0,
        0,
        canvas.height / viewBoxHeight,
        0,
        0
    );
    context.clearRect(0, 0, viewBoxWidth, viewBoxHeight);

    cellsByShade.forEach((shadeCells, shade) => {
        if (shadeCells.length === 0) {
            return;
        }
        context.beginPath();
        for (const cell of shadeCells) {
            context.roundRect(
                cell.x + inset,
                cell.y + inset,
                squareSize,
                squareSize,
                cornerRadius
            );
        }
        context.fillStyle = shadeColors[shade];
        context.fill();
    });
}
