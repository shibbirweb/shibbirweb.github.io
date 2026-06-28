import { hashString } from '@/utils/generateArticleCover';

// Low saturation keeps every derived colour close to a neutral grey; the wash is
// then mixed down to a very low opacity in CSS, so it sits just barely off the
// light/dark background rather than reading as a colourful tint. Only the hue
// really varies per page. Two hues spaced apart give a gentle two-tone shift.
const SATURATION = 35;
const LIGHTNESS = 52;

/**
 * Deterministically derives a two-colour gradient for a page from its route, so
 * every non-home page gets its own "random" wash and any route added later is
 * assigned one automatically (no manual config). Hues come straight from a hash
 * of the route (reusing the article-cover hash), so the space is effectively
 * continuous (360 hues) and distinct routes get distinct colours; the same route
 * always yields the same pair, so builds are reproducible.
 */
export function pageGradientColors(seed: string): { from: string; to: string } {
    const hash = hashString(seed);
    const hueFrom = hash % 360;
    // Offset the second hue by 120-200 degrees so the two colours read as a
    // gradient rather than a single flat tint.
    const hueTo = (hueFrom + 120 + ((hash >>> 8) % 80)) % 360;
    return {
        from: `hsl(${hueFrom} ${SATURATION}% ${LIGHTNESS}%)`,
        to: `hsl(${hueTo} ${SATURATION}% ${LIGHTNESS}%)`,
    };
}
