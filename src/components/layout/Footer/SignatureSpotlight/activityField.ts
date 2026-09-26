// The footer signature's "contribution graph" reveal: the wordmark redrawn as a
// grid of small rounded squares, each tinted by an activity level from 0 (empty)
// to 4 (busiest), like GitHub's contribution calendar. Everything here is pure:
// the cell layout is computed in the signature's own viewBox units, so it is the
// same at every width and the canvas only has to scale it.

// Distance between neighbouring square origins, in viewBox units. The letter
// stems are about 11 units wide, so this fits about five squares across one.
export const ACTIVITY_CELL_PITCH = 2;
// How much of the pitch a square fills; the rest is the gap between squares.
export const ACTIVITY_CELL_FILL = 0.8;
// Corner radius as a share of the square's side (GitHub rounds about 20%).
export const ACTIVITY_CELL_CORNER = 0.2;

// Activity levels run 0..ACTIVITY_LEVEL_COUNT - 1; each maps to the CSS custom
// property --activity-level-<n> in SignatureSpotlight.module.css.
export const ACTIVITY_LEVEL_COUNT = 5;
// Relative chance of each level, weighted towards quiet days like a real graph.
export const ACTIVITY_LEVEL_WEIGHTS: readonly number[] = [
    0.28, 0.3, 0.2, 0.13, 0.09,
];
export const ACTIVITY_FIELD_SEED = 0x5f3759df;

export type ActivityCell = {
    x: number;
    y: number;
};

// Small deterministic PRNG (mulberry32): same seed, same sequence, everywhere.
export function createRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Maps a random number in [0, 1) to an activity level using
 * ACTIVITY_LEVEL_WEIGHTS.
 */
export function pickActivityLevel(randomValue: number): number {
    const totalWeight = ACTIVITY_LEVEL_WEIGHTS.reduce(
        (sum, weight) => sum + weight,
        0
    );
    let threshold = randomValue * totalWeight;
    for (let level = 0; level < ACTIVITY_LEVEL_WEIGHTS.length; level++) {
        threshold -= ACTIVITY_LEVEL_WEIGHTS[level];
        if (threshold < 0) {
            return level;
        }
    }
    return ACTIVITY_LEVEL_WEIGHTS.length - 1;
}

export type ActivityGridLayout = {
    columns: number;
    rows: number;
    offsetX: number;
    offsetY: number;
};

/**
 * How a square grid of `pitch` cells fits a `width` x `height` box: how many
 * whole columns and rows, and the offset that centres them so the leftover
 * sliver splits evenly. Shared by the cell list and the letter mask, so a mask
 * pixel always lines up with its cell.
 */
export function activityGridLayout(
    width: number,
    height: number,
    pitch = ACTIVITY_CELL_PITCH
): ActivityGridLayout {
    const columns = Math.floor(width / pitch);
    const rows = Math.floor(height / pitch);
    return {
        columns,
        rows,
        offsetX: (width - columns * pitch) / 2,
        offsetY: (height - rows * pitch) / 2,
    };
}

/**
 * Lays a square grid over a `width` x `height` box and keeps the cells whose
 * centre `isInsideLetters` accepts, so the kept squares spell the wordmark.
 */
export function listActivityCells(
    width: number,
    height: number,
    isInsideLetters: (x: number, y: number) => boolean,
    pitch = ACTIVITY_CELL_PITCH
): ActivityCell[] {
    const cells: ActivityCell[] = [];
    const { columns, rows, offsetX, offsetY } = activityGridLayout(
        width,
        height,
        pitch
    );
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const x = offsetX + column * pitch;
            const y = offsetY + row * pitch;
            if (isInsideLetters(x + pitch / 2, y + pitch / 2)) {
                cells.push({ x, y });
            }
        }
    }
    return cells;
}

/**
 * For each cell, the indices of the cells around it (up to eight), found by
 * grid position. A square's antialiased edge can share a pixel with its
 * neighbours' edges, so repainting one square exactly means repainting the
 * neighbours that reach into the same pixels.
 */
export function listCellNeighbours(
    cells: readonly ActivityCell[],
    pitch = ACTIVITY_CELL_PITCH
): number[][] {
    const indexByPosition = new Map<string, number>();
    const gridPosition = (cell: ActivityCell) => [
        Math.round(cell.x / pitch),
        Math.round(cell.y / pitch),
    ];
    cells.forEach((cell, index) => {
        const [column, row] = gridPosition(cell);
        indexByPosition.set(`${column},${row}`, index);
    });
    return cells.map((cell) => {
        const [column, row] = gridPosition(cell);
        const neighbours: number[] = [];
        for (let rowStep = -1; rowStep <= 1; rowStep++) {
            for (let columnStep = -1; columnStep <= 1; columnStep++) {
                if (rowStep === 0 && columnStep === 0) {
                    continue;
                }
                const neighbour = indexByPosition.get(
                    `${column + columnStep},${row + rowStep}`
                );
                if (neighbour !== undefined) {
                    neighbours.push(neighbour);
                }
            }
        }
        return neighbours;
    });
}

/**
 * Seeded decorative activity levels, one per cell, shown until the real GitHub
 * calendar arrives (or instead of it, when the proxy cannot be reached). Seeded,
 * so the fallback looks the same on every visit.
 */
export function generateActivityLevels(
    count: number,
    seed = ACTIVITY_FIELD_SEED
): number[] {
    const random = createRandom(seed);
    return Array.from({ length: count }, () => pickActivityLevel(random()));
}

// How far a lit square's shade swells above and below its real level while it
// breathes on hover, in levels. Small, so a square never reads as another level.
export const BREATH_AMPLITUDE = 0.4;
// How far an empty day glows toward level 1 at the top of its breath. Kept
// below 1 - BREATH_AMPLITUDE (the lowest a level 1 day ever dips), so an empty
// day stays visibly quieter than any real activity.
export const EMPTY_DAY_GLOW = 0.45;

/**
 * The level a square shows while breathing: its resting `level`, nudged by a
 * `wave` in -1..1 scaled by `envelope` (0 at rest, 1 fully lit), and kept in
 * range. Empty days (level 0) only glow faintly upward, to at most
 * EMPTY_DAY_GLOW, so they still react to the spotlight without ever reading
 * as a day with activity.
 */
export function breatheLevel(
    level: number,
    wave: number,
    envelope: number
): number {
    if (level <= 0) {
        return envelope * EMPTY_DAY_GLOW * (0.5 + 0.5 * wave);
    }
    const breathing = level + wave * envelope * BREATH_AMPLITUDE;
    return Math.min(Math.max(breathing, 0), ACTIVITY_LEVEL_COUNT - 1);
}
