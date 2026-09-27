// Colour blending for the contribution graph, so a square changing level can
// fade through the in-between shades instead of jumping. A square's displayed
// level is a fraction (e.g. 2.4 on its way from 2 to 3); it is rounded to one
// of SHADES_PER_LEVEL steps between neighbouring levels, and each step's colour
// is mixed once per draw, so squares can still be batched by colour.

export const SHADES_PER_LEVEL = 8;

export type RgbColor = [number, number, number];

/**
 * Parses `#rgb` or `#rrggbb`; anything else returns null, so the caller can
 * fall back to the nearest level colour rather than mixing garbage.
 */
export function parseHexColor(value: string): RgbColor | null {
    const hex = value.trim().replace(/^#/, '');
    if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
        return null;
    }
    const fullHex =
        hex.length === 3
            ? hex
                  .split('')
                  .map((digit) => digit + digit)
                  .join('')
            : hex;
    return [
        parseInt(fullHex.slice(0, 2), 16),
        parseInt(fullHex.slice(2, 4), 16),
        parseInt(fullHex.slice(4, 6), 16),
    ];
}

/**
 * The colour `amount` of the way from `from` to `to` (0 is `from`, 1 is `to`).
 */
export function mixColors(
    from: RgbColor,
    to: RgbColor,
    amount: number
): string {
    const channels = from.map((channel, index) =>
        Math.round(channel + (to[index] - channel) * amount)
    );
    return `rgb(${channels.join(' ')})`;
}

/**
 * Every shade from the first level colour to the last, SHADES_PER_LEVEL steps
 * between each pair of neighbouring levels, indexed by shadeIndexFor.
 */
export function buildShadeColors(levelColors: readonly string[]): string[] {
    const parsedColors = levelColors.map(parseHexColor);
    const shadeCount = (levelColors.length - 1) * SHADES_PER_LEVEL + 1;
    return Array.from({ length: shadeCount }, (_, shade) => {
        const lowerLevel = Math.floor(shade / SHADES_PER_LEVEL);
        const amount = (shade % SHADES_PER_LEVEL) / SHADES_PER_LEVEL;
        const lowerColor = parsedColors[lowerLevel];
        const upperColor = parsedColors[lowerLevel + 1];
        if (amount === 0 || !lowerColor || !upperColor) {
            return levelColors[Math.round(shade / SHADES_PER_LEVEL)];
        }
        return mixColors(lowerColor, upperColor, amount);
    });
}

/**
 * The shade index for a fractional displayed level.
 */
export function shadeIndexFor(displayedLevel: number): number {
    return Math.round(displayedLevel * SHADES_PER_LEVEL);
}
