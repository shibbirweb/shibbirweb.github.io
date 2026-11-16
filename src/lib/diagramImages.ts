import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { parseFlowDiagram } from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';
import { flowMermaidSource } from '@/components/pages/articles/FlowDiagram/toMermaid';
import { mermaidConfig } from '@/components/pages/articles/MermaidRenderer/mermaidTheme';
import { DIAGRAM_FALLBACK_IMAGE_CLASS } from '@/components/pages/articles/diagramFallbackImage';

// Pre-rendered PNGs of the article diagrams, for browser reading modes.
//
// On the page a diagram is drawn in the browser (Mermaid, or React Flow over a
// Mermaid static view), as an SVG inside interactive controls. Reading modes
// (Chrome Reading mode, Firefox Reader View) run Readability over the page and
// throw that SVG and its controls away, so a diagram used to vanish from them.
// `pnpm gen:diagrams` (run by `pnpm build`) renders each diagram once to a PNG in
// public/diagrams/, and the Markdown pipeline puts it beside the diagram as a
// hidden fallback image that those readers keep (see diagramImageTag). The PNGs
// are git-ignored build artifacts; a build check fails when a diagram ships
// without one.

/** Bumped when the way images are drawn changes, so every key changes with it. */
const RENDER_VERSION = 1;

/** Images are captured at twice their CSS size, so they stay sharp on HiDPI. */
export const DIAGRAM_IMAGE_SCALE = 2;

/** Widest a diagram is drawn (CSS px), about the article body's measure. */
export const DIAGRAM_IMAGE_MAX_WIDTH = 712;

/** Where the PNGs live on disk, and the URL path they are served from. */
export const DIAGRAM_IMAGE_DIRECTORY = path.join(
    process.cwd(),
    'public/diagrams'
);
const DIAGRAM_IMAGE_URL_PATH = '/diagrams';

export { DIAGRAM_FALLBACK_IMAGE_CLASS };

export interface DiagramImage {
    /** Content hash naming the PNG: changes whenever the drawing would. */
    key: string;
    /** The Mermaid source the PNG is drawn from. */
    mermaidSource: string;
    alt: string;
}

/**
 * The image a fenced diagram block gets, or null when the block is not a diagram
 * (or is a reactflow block that does not parse, which renders as plain text).
 * A reactflow block is drawn as its first scenario, the one the page opens on.
 */
export function diagramImageFor(
    language: string,
    body: string
): DiagramImage | null {
    if (language === 'mermaid') {
        return withKey(body, mermaidAltText(body));
    }
    if (language === 'reactflow') {
        return reactflowDiagramImage(body);
    }
    return null;
}

/** Every diagram image an article body needs, in document order. */
export function collectDiagramImages(markdown: string): DiagramImage[] {
    const images: DiagramImage[] = [];
    marked.walkTokens(marked.lexer(markdown), (token) => {
        if (token.type !== 'code') {
            return;
        }
        const language = (token.lang ?? '').trim().split(/\s+/)[0];
        const image = diagramImageFor(language, token.text);
        if (image) {
            images.push(image);
        }
    });
    return images;
}

export function diagramImageFilePath(key: string): string {
    return path.join(DIAGRAM_IMAGE_DIRECTORY, `${key}.png`);
}

export function diagramImageUrl(key: string): string {
    return `${DIAGRAM_IMAGE_URL_PATH}/${key}.png`;
}

/** Pixel size from a PNG's IHDR chunk, or null when the bytes are not a PNG. */
export function readPngSize(
    bytes: Buffer
): { width: number; height: number } | null {
    const pngSignature = '89504e470d0a1a0a';
    if (
        bytes.length < 24 ||
        bytes.subarray(0, 8).toString('hex') !== pngSignature
    ) {
        return null;
    }
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/**
 * The hidden `<img>` for a diagram, or '' when its PNG has not been generated
 * (e.g. under `pnpm dev`, which skips gen:diagrams), so the page never points at
 * a 404.
 *
 * Hidden from everyone on the page: `aria-hidden` keeps it away from screen
 * readers, which already get the live diagram, and the article stylesheet sets
 * `display: none` through the class. Readability checks only inline styles, the
 * `hidden` attribute and `aria-hidden` (excepting "fallback-image" classes), so
 * reading modes still keep it. Lazy loading plus `display: none` means a normal
 * visit never downloads it; a reading mode fetches it when it shows the article.
 */
export function diagramImageTag(image: DiagramImage): string {
    const filePath = diagramImageFilePath(image.key);
    if (!fs.existsSync(filePath)) {
        return '';
    }
    const size = readPngSize(fs.readFileSync(filePath));
    if (!size) {
        return '';
    }
    const width = Math.round(size.width / DIAGRAM_IMAGE_SCALE);
    const height = Math.round(size.height / DIAGRAM_IMAGE_SCALE);
    return (
        `<img class="${DIAGRAM_FALLBACK_IMAGE_CLASS}" ` +
        `src="${diagramImageUrl(image.key)}" alt="${escapeAttribute(image.alt)}" ` +
        `width="${width}" height="${height}" loading="lazy" decoding="async" ` +
        `aria-hidden="true">`
    );
}

/**
 * The hidden pre-rendered image of a diagram block, placed before it so a browser
 * reading mode (which drops the live SVG) shows the picture ahead of the caption.
 * Empty for a block that is not a diagram, and until `pnpm gen:diagrams` has
 * drawn it. Registered with the Markdown pipeline by server code (see
 * setDiagramFallbackImageRenderer in markdown.ts).
 */
export function diagramFallbackImage(language: string, body: string): string {
    const image = diagramImageFor(language, body);
    if (!image) {
        return '';
    }
    return diagramImageTag(image);
}

/**
 * The key covers the source, the light-theme Mermaid configuration and the render
 * version, so a theme tweak marks every image stale just as an edit to the
 * diagram does.
 */
export function diagramImageKey(mermaidSource: string): string {
    return crypto
        .createHash('sha256')
        .update(
            JSON.stringify([
                RENDER_VERSION,
                mermaidConfig(false),
                mermaidSource,
            ])
        )
        .digest('hex')
        .slice(0, 16);
}

function withKey(mermaidSource: string, alt: string): DiagramImage {
    return { key: diagramImageKey(mermaidSource), mermaidSource, alt };
}

function reactflowDiagramImage(body: string): DiagramImage | null {
    try {
        const definition = parseFlowDiagram(body);
        const scenario = definition.scenarios[0];
        const name = definition.title ?? scenario.label;
        return withKey(
            flowMermaidSource(definition, scenario),
            `Diagram: ${name}`
        );
    } catch {
        return null;
    }
}

/** Mermaid's own `accTitle:` line names the diagram when the author wrote one. */
function mermaidAltText(source: string): string {
    const title = source.match(/^\s*accTitle\s*:\s*(.+)$/m)?.[1].trim();
    if (title) {
        return `Diagram: ${title}`;
    }
    return 'Diagram';
}

function escapeAttribute(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
