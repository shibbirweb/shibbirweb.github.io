/** One table-of-contents entry, measured inside the list (pixels). */
export type RailItem = {
    top: number;
    bottom: number;
    /** 0 for an H2, 1 for a nested H3. */
    depth: number;
};

/**
 * The highlighted stretch of the rail. `top`/`bottom` are its ends and
 * `topX`/`bottomX` the rail's x at each end, so the head dot can sit on
 * whichever end leads the scroll.
 */
export type RailRange = {
    top: number;
    bottom: number;
    topX: number;
    bottomX: number;
};

/** Horizontal step between nesting depths. */
export const RAIL_INDENT_PX = 12;

/** Half the height of the S-curve where the rail steps between depths. */
const BEND_PX = 6;

/** The rail's x position at a depth (offset so a 2px stroke is not clipped). */
export function railX(depth: number): number {
    return depth * RAIL_INDENT_PX + 1;
}

/** Nesting depth of a TOC entry from its heading level. */
export function tocDepth(level: number): number {
    if (level >= 3) {
        return 1;
    }
    return 0;
}

/**
 * The SVG path of the rail: a vertical line beside each entry at its depth,
 * with a short S-curve between entries of different depths, centred on the
 * gap between them.
 */
export function buildRailPath(items: RailItem[]): string {
    const firstItem = items[0];
    if (!firstItem) {
        return '';
    }

    const segments = [`M ${railX(firstItem.depth)} ${firstItem.top}`];

    items.forEach((item, index) => {
        const itemX = railX(item.depth);
        const nextItem = items[index + 1];

        if (!nextItem || nextItem.depth === item.depth) {
            segments.push(`L ${itemX} ${item.bottom}`);
            return;
        }

        const nextX = railX(nextItem.depth);
        const middleY = (item.bottom + nextItem.top) / 2;
        segments.push(`L ${itemX} ${middleY - BEND_PX}`);
        segments.push(
            `C ${itemX} ${middleY} ${nextX} ${middleY} ${nextX} ${middleY + BEND_PX}`
        );
    });

    return segments.join(' ');
}

/**
 * The stretch of rail covering the visible entries, from the top of the first
 * to the bottom of the last. Each end stops on the straight part of the line,
 * short of a bend into a neighbouring entry, so a dot placed there sits on the
 * line. Null when nothing is visible.
 */
export function railRange(
    items: RailItem[],
    visibleIndexes: number[]
): RailRange | null {
    const firstVisible = items[visibleIndexes[0]];
    const lastIndex = visibleIndexes[visibleIndexes.length - 1];
    const lastVisible = items[lastIndex];
    if (!firstVisible || !lastVisible) {
        return null;
    }

    const previousItem = items[visibleIndexes[0] - 1];
    let top = firstVisible.top;
    if (previousItem && previousItem.depth !== firstVisible.depth) {
        top = (previousItem.bottom + firstVisible.top) / 2 + BEND_PX;
    }

    const nextItem = items[lastIndex + 1];
    let bottom = lastVisible.bottom;
    if (nextItem && nextItem.depth !== lastVisible.depth) {
        bottom = (lastVisible.bottom + nextItem.top) / 2 - BEND_PX;
    }

    return {
        top,
        bottom,
        topX: railX(firstVisible.depth),
        bottomX: railX(lastVisible.depth),
    };
}
