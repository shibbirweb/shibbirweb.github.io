// Pure helpers that build a 1200x630 SVG cover for an article from its title and
// first tag. Mirrors the hand-authored covers in public/images/articles so a
// generated thumbnail is visually consistent with provided ones. Used at build
// time by scripts/generate-covers.ts; generatedCoverPath is also read by
// src/lib/posts.ts so the write location and the resolved `cover` never drift.

// Diagonal gradient [from, to] pairs, picked deterministically per article.
// Each pair blends two adjacent hues (not just a light/dark shade) so the
// transition reads as a real, soothing gradient rather than a flat fill.
const COVER_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
    ['#4f46e5', '#7c3aed'], // indigo -> violet
    ['#0d9488', '#0891b2'], // teal -> cyan
    ['#2563eb', '#4f46e5'], // blue -> indigo
    ['#db2777', '#9333ea'], // pink -> purple
    ['#0284c7', '#2563eb'], // sky -> blue
    ['#059669', '#0d9488'], // emerald -> teal
    ['#dc2626', '#db2777'], // red -> pink
    ['#7c3aed', '#c026d3'], // violet -> fuchsia
    ['#d97706', '#dc2626'], // amber -> red (warm sunset)
    ['#0891b2', '#2563eb'], // cyan -> blue
];

/** Title block geometry, matching the hand-authored covers. */
const TITLE_FONT_SIZE = 62;
const TITLE_LINE_HEIGHT = 74;
const TITLE_CENTER_Y = 300;
const TITLE_MAX_LINES = 4;
const TITLE_CHARS_PER_LINE = 18;

/** Deterministic, stable string hash (djb2). Same input -> same output. */
export function hashString(seed: string): number {
    let hash = 5381;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 33) ^ seed.charCodeAt(i);
    }
    // Coerce to an unsigned 32-bit integer.
    return hash >>> 0;
}

/**
 * Greedy word wrap by an approximate character budget, capped at TITLE_MAX_LINES.
 * If the title overflows, the last kept line is truncated with an ellipsis.
 */
export function wrapTitleLines(title: string): string[] {
    const words = title.trim().split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= TITLE_CHARS_PER_LINE || !current) {
            current = candidate;
        } else {
            lines.push(current);
            current = word;
        }
        if (lines.length === TITLE_MAX_LINES) break;
    }

    if (lines.length < TITLE_MAX_LINES && current) {
        lines.push(current);
    }

    // Anything left over (title longer than the line budget) gets an ellipsis.
    const consumed = lines.join(' ').split(/\s+/).filter(Boolean).length;
    if (consumed < words.length && lines.length > 0) {
        lines[lines.length - 1] = `${lines[lines.length - 1]}…`;
    }

    return lines.length > 0 ? lines : [title.trim()];
}

/** Escapes text for safe inclusion in SVG text/attribute content. */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Public path for an article's generated cover. Single source of truth. */
export function generatedCoverPath(slug: string): string {
    return `/images/articles/generated/${slug}.svg`;
}

/**
 * Builds a complete 1200x630 SVG cover string for an article. The gradient is
 * chosen deterministically from the slug, so rebuilds are reproducible.
 */
export function buildArticleCoverSvg({
    slug,
    title,
    tag,
}: {
    slug: string;
    title: string;
    tag?: string;
}): string {
    const [from, to] = COVER_GRADIENTS[hashString(slug) % COVER_GRADIENTS.length];
    const gradientId = `bg-${slug}`;
    const glowId = `glow-${slug}`;
    const lines = wrapTitleLines(title);
    const firstLineY = TITLE_CENTER_Y - ((lines.length - 1) * TITLE_LINE_HEIGHT) / 2;

    const tagLabel = tag?.trim().toUpperCase();
    const tagText = tagLabel
        ? `<text x="90" y="120" font-family="system-ui, sans-serif" font-size="30" font-weight="600" fill="#ffffff" opacity="0.85" letter-spacing="2">${escapeXml(tagLabel)}</text>`
        : '';

    const titleTspans = lines
        .map(
            (line, index) =>
                `<tspan x="90" y="${firstLineY + index * TITLE_LINE_HEIGHT}">${escapeXml(line)}</tspan>`
        )
        .join('');

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(title)}">\n` +
        `  <defs>\n` +
        `    <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">\n` +
        `      <stop offset="0" stop-color="${from}"/>\n` +
        `      <stop offset="1" stop-color="${to}"/>\n` +
        `    </linearGradient>\n` +
        // Soft light glow in the top-right corner adds depth without washing out
        // the left-aligned text.
        `    <radialGradient id="${glowId}" cx="0.78" cy="0.18" r="0.9">\n` +
        `      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>\n` +
        `      <stop offset="0.6" stop-color="#ffffff" stop-opacity="0"/>\n` +
        `    </radialGradient>\n` +
        `  </defs>\n` +
        `  <rect width="1200" height="630" fill="url(#${gradientId})"/>\n` +
        `  <rect width="1200" height="630" fill="url(#${glowId})"/>\n` +
        `  <rect width="1200" height="630" fill="#000" opacity="0.10"/>\n` +
        `  ${tagText}\n` +
        `  <text font-family="system-ui, sans-serif" font-size="${TITLE_FONT_SIZE}" font-weight="800" fill="#ffffff">${titleTspans}</text>\n` +
        `  <text x="90" y="560" font-family="system-ui, sans-serif" font-size="28" font-weight="600" fill="#ffffff" opacity="0.8">shibbir.me</text>\n` +
        `</svg>\n`
    );
}
