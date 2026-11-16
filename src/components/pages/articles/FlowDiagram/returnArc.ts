// The path for a hop that runs backwards: right to left, against the layout's
// left-to-right flow, such as a webhook coming back to the app that started the
// exchange. A step path would have to squeeze around the boxes it connects, and
// its label lands on top of the others. A curve that swings out, dips under both
// boxes and comes back in reads as "and then it comes back".

/** How far below the lower handle the curve's control points sit. */
export const RETURN_ARC_DEPTH = 150;
/** How far past each end the curve swings out sideways before turning. */
export const RETURN_ARC_REACH = 90;

export interface HopEnds {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}

/** A hop is a return when its target sits to the left of its source. */
export function isReturnHop({ sourceX, targetX }: HopEnds): boolean {
    return targetX < sourceX;
}

/**
 * The SVG path for a return hop, plus where its label sits, in the same
 * `[path, labelX, labelY]` shape React Flow's path helpers return. The label is
 * the curve's midpoint, the lowest point of the arc.
 */
export function returnArcPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
}: HopEnds): [path: string, labelX: number, labelY: number] {
    const controlY = Math.max(sourceY, targetY) + RETURN_ARC_DEPTH;
    const sourceControlX = sourceX + RETURN_ARC_REACH;
    const targetControlX = targetX - RETURN_ARC_REACH;

    const path =
        `M ${sourceX},${sourceY} ` +
        `C ${sourceControlX},${controlY} ${targetControlX},${controlY} ${targetX},${targetY}`;

    // A cubic Bezier at t = 0.5 weighs its four points 1/8, 3/8, 3/8, 1/8.
    const labelX =
        (sourceX + 3 * sourceControlX + 3 * targetControlX + targetX) / 8;
    const labelY = (sourceY + 6 * controlY + targetY) / 8;

    return [path, labelX, labelY];
}
