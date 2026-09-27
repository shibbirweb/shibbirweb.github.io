/**
 * Moves `current` toward `target` with exponential smoothing: after
 * `timeConstantMs` it has covered about 63% of the distance, after three time
 * constants about 95%. Frame-rate independent, so it feels the same at 60Hz and
 * 120Hz. A time constant of zero or less jumps straight to the target.
 */
export function easeToward(
    current: number,
    target: number,
    elapsedMs: number,
    timeConstantMs: number
): number {
    if (timeConstantMs <= 0) {
        return target;
    }
    return target + (current - target) * Math.exp(-elapsedMs / timeConstantMs);
}
