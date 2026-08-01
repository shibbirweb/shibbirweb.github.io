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
    ['#e11d48', '#db2777'], // rose -> pink
    ['#c026d3', '#9333ea'], // fuchsia -> purple
    ['#9333ea', '#4f46e5'], // purple -> indigo
    ['#65a30d', '#16a34a'], // lime -> green
    ['#16a34a', '#059669'], // green -> emerald
    ['#ea580c', '#d97706'], // orange -> amber
    ['#ca8a04', '#ea580c'], // yellow -> orange
    ['#0284c7', '#0891b2'], // sky -> cyan
    ['#2563eb', '#0284c7'], // blue -> sky
    ['#4f46e5', '#2563eb'], // indigo -> blue
    ['#0d9488', '#059669'], // teal -> emerald
    ['#e11d48', '#dc2626'], // rose -> red
    ['#c026d3', '#db2777'], // fuchsia -> pink
    ['#7c3aed', '#9333ea'], // violet -> purple
    ['#0891b2', '#0d9488'], // cyan -> teal
    ['#ea580c', '#dc2626'], // orange -> red
    ['#059669', '#16a34a'], // emerald -> green
    ['#db2777', '#e11d48'], // pink -> rose
    ['#6366f1', '#8b5cf6'], // indigo -> violet (soft)
    ['#0ea5e9', '#6366f1'], // sky -> indigo
];

/**
 * Title block geometry, matching the hand-authored covers. The text column runs
 * from TITLE_X to a mirrored right margin, and the block stays centred on
 * TITLE_CENTER_Y between the tag eyebrow (baseline y=120) and the shibbir.me
 * footer (baseline y=560).
 */
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;
const TITLE_X = 90;
const TITLE_MAX_WIDTH = COVER_WIDTH - TITLE_X * 2;
const TITLE_CENTER_Y = 300;
/** The title block stays inside this band so it never touches the eyebrow or footer. */
const TITLE_TOP_LIMIT = 172;
const TITLE_BOTTOM_LIMIT = 512;
const TITLE_MAX_BLOCK_HEIGHT = TITLE_BOTTOM_LIMIT - TITLE_TOP_LIMIT;
/** Cap height and descender depth as a fraction of the font size. */
const TITLE_ASCENT_RATIO = 0.78;
const TITLE_MAX_LINES = 6;
const TITLE_MAX_FONT_SIZE = 62;
const TITLE_MIN_FONT_SIZE = 38;
const TITLE_FONT_SIZE_STEP = 2;
/** Preserves the 62/74 size-to-leading ratio of the hand-authored covers. */
const TITLE_LINE_HEIGHT_RATIO = 74 / 62;

/**
 * Approximate advance widths, in per mille of the font size, for the bold sans
 * serif a cover renders in: Noto Sans Bold in the rasterised OpenGraph PNG,
 * system-ui in the browser. Noto Sans is the wider of the two, so measuring
 * against it keeps the browser rendering comfortably inside the column.
 */
const CHARACTER_WIDTH_GROUPS: ReadonlyArray<readonly [number, string]> = [
    [240, "'’"],
    [260, ' '],
    [265, 'ijl'],
    [300, 'IJ.,:;'],
    [320, '!'],
    [360, 'f'],
    [380, '()[]'],
    [400, 't-'],
    [410, 'r'],
    [420, '"“”'],
    [460, '/'],
    [470, 'z'],
    [480, '*'],
    [500, 's'],
    [520, 'cvy?'],
    [530, 'x'],
    [560, 'aek'],
    [570, 'FL'],
    [590, 'hnou'],
    [600, 'bdgpqESZ0123456789+='],
    [620, 'T'],
    [630, 'Y'],
    [640, 'P#'],
    [660, 'BKRX'],
    [670, 'V'],
    [680, 'AC'],
    [720, 'D&'],
    [730, 'GU'],
    [750, 'HN'],
    [770, 'OQ'],
    [780, 'w'],
    [850, '%'],
    [900, 'mM@…'],
    [960, 'W'],
];

const CHARACTER_WIDTHS: ReadonlyMap<string, number> = new Map(
    CHARACTER_WIDTH_GROUPS.flatMap(([width, characters]) =>
        [...characters].map((character): [string, number] => [
            character,
            width,
        ])
    )
);

const DEFAULT_CHARACTER_WIDTH = 600;
/** Head-room for kerning and for a font a shade wider than the table above. */
const WIDTH_SAFETY_FACTOR = 1.02;

/** Deterministic, stable string hash (djb2). Same input -> same output. */
export function hashString(seed: string): number {
    let hash = 5381;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 33) ^ seed.charCodeAt(i);
    }
    // Coerce to an unsigned 32-bit integer.
    return hash >>> 0;
}

/** Estimated rendered width of a run of text, in SVG user units. */
export function measureTitleWidth(text: string, fontSize: number): number {
    let perMille = 0;
    for (const character of text) {
        perMille += CHARACTER_WIDTHS.get(character) ?? DEFAULT_CHARACTER_WIDTH;
    }
    return (perMille / 1000) * fontSize * WIDTH_SAFETY_FACTOR;
}

/**
 * Splits a single word too wide for the column (a long URL or a hyphen-less
 * identifier) into chunks that each fit. Ordinary titles never reach this.
 */
function breakLongWord(word: string, fontSize: number): string[] {
    if (measureTitleWidth(word, fontSize) <= TITLE_MAX_WIDTH) return [word];

    const chunks: string[] = [];
    let chunk = '';

    for (const character of word) {
        const candidate = chunk + character;
        if (chunk && measureTitleWidth(candidate, fontSize) > TITLE_MAX_WIDTH) {
            chunks.push(chunk);
            chunk = character;
        } else {
            chunk = candidate;
        }
    }

    if (chunk) chunks.push(chunk);
    return chunks;
}

/** Greedy word wrap by measured width, with no cap on the number of lines. */
function wrapToColumn(title: string, fontSize: number): string[] {
    const words = title.trim().split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (measureTitleWidth(candidate, fontSize) <= TITLE_MAX_WIDTH) {
            current = candidate;
            continue;
        }

        if (current) lines.push(current);
        const chunks = breakLongWord(word, fontSize);
        current = chunks.pop() ?? '';
        lines.push(...chunks);
    }

    if (current) lines.push(current);
    return lines.length > 0 ? lines : [title.trim()];
}

/**
 * How many lines fit in the title band at a given size. Successive lines cost a
 * line height each, and the block additionally needs room for the first line's
 * ascender and the last line's descender, together about one font size.
 */
function maxLinesAtFontSize(fontSize: number, lineHeight: number): number {
    const fitted =
        Math.floor((TITLE_MAX_BLOCK_HEIGHT - fontSize) / lineHeight) + 1;
    return Math.max(1, Math.min(TITLE_MAX_LINES, fitted));
}

/**
 * Baseline of the first line. The block is centred on TITLE_CENTER_Y, then
 * pushed down if a tall block would otherwise ride up into the tag eyebrow. The
 * line count is already capped so the pushed-down block stays clear of the
 * footer.
 */
function firstLineBaselineY(
    lineCount: number,
    fontSize: number,
    lineHeight: number
): number {
    const centred = TITLE_CENTER_Y - ((lineCount - 1) * lineHeight) / 2;
    const ascenderTop = centred - fontSize * TITLE_ASCENT_RATIO;
    return ascenderTop >= TITLE_TOP_LIMIT
        ? centred
        : centred + (TITLE_TOP_LIMIT - ascenderTop);
}

/** Trims a line until it plus an ellipsis fits the column. */
function truncateToColumn(line: string, fontSize: number): string {
    let truncated = line;
    while (
        truncated.length > 1 &&
        measureTitleWidth(`${truncated}…`, fontSize) > TITLE_MAX_WIDTH
    ) {
        truncated = truncated.slice(0, -1);
    }
    return `${truncated.trimEnd()}…`;
}

export interface CoverTitleLayout {
    lines: string[];
    fontSize: number;
    lineHeight: number;
    firstLineY: number;
}

function toLayout(
    lines: string[],
    fontSize: number,
    lineHeight: number
): CoverTitleLayout {
    return {
        lines,
        fontSize,
        lineHeight,
        firstLineY: firstLineBaselineY(lines.length, fontSize, lineHeight),
    };
}

/**
 * Lays the title out so it always fits the cover: it wraps to the measured
 * column width at the largest size whose line count still fits the block, and
 * steps the size down only when a longer title needs it. Truncation is a last
 * resort at TITLE_MIN_FONT_SIZE rather than the routine outcome of a long title.
 */
export function layoutCoverTitle(title: string): CoverTitleLayout {
    for (
        let fontSize = TITLE_MAX_FONT_SIZE;
        fontSize >= TITLE_MIN_FONT_SIZE;
        fontSize -= TITLE_FONT_SIZE_STEP
    ) {
        const lineHeight = Math.round(fontSize * TITLE_LINE_HEIGHT_RATIO);
        const lines = wrapToColumn(title, fontSize);
        if (lines.length <= maxLinesAtFontSize(fontSize, lineHeight)) {
            return toLayout(lines, fontSize, lineHeight);
        }
    }

    const fontSize = TITLE_MIN_FONT_SIZE;
    const lineHeight = Math.round(fontSize * TITLE_LINE_HEIGHT_RATIO);
    const lines = wrapToColumn(title, fontSize).slice(
        0,
        maxLinesAtFontSize(fontSize, lineHeight)
    );
    lines[lines.length - 1] = truncateToColumn(
        lines[lines.length - 1],
        fontSize
    );

    return toLayout(lines, fontSize, lineHeight);
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
 * Public path for an article's raster OpenGraph image. Social crawlers do not
 * render SVG, so scripts/generate-og-images.ts rasterises each SVG cover to a PNG
 * here at build time; generateMetadata and the article JSON-LD point at this same
 * path so the write location and the meta URL never drift.
 */
export function articleOgImagePath(slug: string): string {
    return `/og/articles/${slug}.png`;
}

/**
 * The [from, to] gradient pair a generated cover is built from, chosen
 * deterministically per slug. Exported so the article card can tint itself with
 * the same colours as its thumbnail without re-parsing the generated SVG.
 */
export function coverGradientForSlug(slug: string): readonly [string, string] {
    return COVER_GRADIENTS[hashString(slug) % COVER_GRADIENTS.length];
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
    const [from, to] = coverGradientForSlug(slug);
    const gradientId = `bg-${slug}`;
    const glowId = `glow-${slug}`;
    const { lines, fontSize, lineHeight, firstLineY } = layoutCoverTitle(title);

    const tagLabel = tag?.trim().toUpperCase();
    const tagText = tagLabel
        ? `<text x="${TITLE_X}" y="120" font-family="system-ui, sans-serif" font-size="30" font-weight="600" fill="#ffffff" opacity="0.85" letter-spacing="2">${escapeXml(tagLabel)}</text>`
        : '';

    const titleTspans = lines
        .map(
            (line, index) =>
                `<tspan x="${TITLE_X}" y="${firstLineY + index * lineHeight}">${escapeXml(line)}</tspan>`
        )
        .join('');

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" role="img" aria-label="${escapeXml(title)}">\n` +
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
        `  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#${gradientId})"/>\n` +
        `  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#${glowId})"/>\n` +
        `  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="#000" opacity="0.10"/>\n` +
        `  ${tagText}\n` +
        `  <text font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="800" fill="#ffffff">${titleTspans}</text>\n` +
        `  <text x="${TITLE_X}" y="560" font-family="system-ui, sans-serif" font-size="28" font-weight="600" fill="#ffffff" opacity="0.8">shibbir.me</text>\n` +
        `</svg>\n`
    );
}
