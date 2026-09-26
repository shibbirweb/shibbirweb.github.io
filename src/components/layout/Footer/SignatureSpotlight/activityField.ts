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
    const columns = Math.floor(width / pitch);
    const rows = Math.floor(height / pitch);
    // Centre the grid in the box so the leftover sliver splits evenly.
    const offsetX = (width - columns * pitch) / 2;
    const offsetY = (height - rows * pitch) / 2;
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
 * Seeded activity levels, one per cell, so the graph looks the same on every
 * visit until the flicker starts shifting it.
 */
export function generateActivityLevels(
    count: number,
    seed = ACTIVITY_FIELD_SEED
): number[] {
    const random = createRandom(seed);
    return Array.from({ length: count }, () => pickActivityLevel(random()));
}
