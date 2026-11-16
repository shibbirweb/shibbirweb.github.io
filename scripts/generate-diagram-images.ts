// Renders every article diagram to a PNG in public/diagrams/, for browser reading
// modes (see src/lib/diagramImages.ts for why they exist and how the page uses
// them).
//
// Run `pnpm gen:diagrams` after adding or editing a ```mermaid or ```reactflow
// block, or after changing the Mermaid theme, and commit the result. It is not
// part of `pnpm build` because drawing Mermaid needs a real browser (it measures
// text to lay boxes out), and the deploy workflow does not install one. The
// content suite (tests/content/diagramImages.test.ts) fails when an image is
// missing or stale, so a forgotten run is caught in CI rather than shipped.
//
// Images are drawn with the site's own light Mermaid theme and bundled Noto Sans,
// on the light page background, at 2x for HiDPI screens. A PNG whose key already
// exists is kept (the key is a hash of everything that affects the drawing), and
// PNGs no article uses any more are deleted. Pass --force to redraw them all.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { mermaidConfig } from '@/components/pages/articles/MermaidRenderer/mermaidTheme';
import {
    DIAGRAM_IMAGE_DIRECTORY,
    DIAGRAM_IMAGE_MAX_WIDTH,
    DIAGRAM_IMAGE_SCALE,
    collectDiagramImages,
    diagramImageFilePath,
    type DiagramImage,
} from '@/lib/diagramImages';

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');
const GLOBALS_CSS = path.join(process.cwd(), 'src/app/globals.css');
const FONTS_DIRECTORY = path.join(process.cwd(), 'scripts/assets/fonts');
const MERMAID_SCRIPT = path.join(
    process.cwd(),
    'node_modules/mermaid/dist/mermaid.min.js'
);

/** Breathing room around the diagram, in CSS px. */
const FRAME_PADDING = 24;

const FONT_FACES = [
    { file: 'NotoSans-Regular.ttf', weight: 400 },
    { file: 'NotoSans-SemiBold.ttf', weight: 600 },
    { file: 'NotoSans-Bold.ttf', weight: 700 },
];

const shouldRedrawAll = process.argv.includes('--force');

function articleDiagramImages(): DiagramImage[] {
    const byKey = new Map<string, DiagramImage>();
    const fileNames = fs
        .readdirSync(ARTICLES_DIRECTORY)
        .filter((name) => /\.mdx?$/.test(name))
        .sort();
    for (const fileName of fileNames) {
        const markdown = fs.readFileSync(
            path.join(ARTICLES_DIRECTORY, fileName),
            'utf8'
        );
        for (const image of collectDiagramImages(markdown)) {
            byKey.set(image.key, image);
        }
    }
    return [...byKey.values()];
}

/** A light-theme token from the first `:root` block in globals.css. */
function lightToken(css: string, name: string): string {
    const value = css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];
    if (!value) {
        throw new Error(
            `generate-diagram-images: --${name} not found in globals.css`
        );
    }
    return value.trim();
}

function renderPageHtml(): string {
    const css = fs.readFileSync(GLOBALS_CSS, 'utf8');
    const fontFaces = FONT_FACES.map(({ file, weight }) => {
        const base64 = fs
            .readFileSync(path.join(FONTS_DIRECTORY, file))
            .toString('base64');
        return `@font-face { font-family: 'Noto Sans'; font-weight: ${weight}; src: url(data:font/ttf;base64,${base64}) format('truetype'); }`;
    }).join('\n');
    // The Mermaid theme reads the page's colour tokens and the next/font variable
    // for Noto Sans, so the render page defines them with their light values.
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
${fontFaces}
:root {
    --background: ${lightToken(css, 'background')};
    --foreground: ${lightToken(css, 'foreground')};
    --font-noto-sans: 'Noto Sans';
}
/* Mermaid drops the var() font family when it measures label text, so the
   measurement inherits the body font. The site's body is Noto Sans; anything
   else (the browser default is Times) sizes boxes for the wrong font. */
body { margin: 0; font-family: 'Noto Sans', sans-serif; background: var(--background); color: var(--foreground); }
#frame { display: inline-block; padding: ${FRAME_PADDING}px; background: var(--background); }
#frame svg { display: block; }
</style>
</head>
<body><div id="frame"></div></body>
</html>`;
}

async function main() {
    const images = articleDiagramImages();
    fs.mkdirSync(DIAGRAM_IMAGE_DIRECTORY, { recursive: true });

    const pending = images.filter(
        (image) =>
            shouldRedrawAll || !fs.existsSync(diagramImageFilePath(image.key))
    );

    if (pending.length > 0) {
        const browser = await chromium.launch();
        const pageHtml = renderPageHtml();

        for (const [index, image] of pending.entries()) {
            // A fresh page per diagram, as on the site, where each diagram is
            // its own render: Mermaid keeps state between renders in one page,
            // and a sequence diagram drawn after another diagram came out with
            // boxes narrower than their labels.
            const page = await browser.newPage({
                viewport: {
                    width: DIAGRAM_IMAGE_MAX_WIDTH + FRAME_PADDING * 2 + 40,
                    height: 800,
                },
                deviceScaleFactor: DIAGRAM_IMAGE_SCALE,
            });
            await page.setContent(pageHtml);
            await page.addScriptTag({ path: MERMAID_SCRIPT });
            // Mermaid measures label text while laying out, so the font has to
            // be ready first or boxes are sized for the fallback font.
            await page.evaluate(async () => {
                await Promise.all(
                    ['400', '600', '700'].map((weight) =>
                        document.fonts.load(`${weight} 14px "Noto Sans"`)
                    )
                );
            });
            await page.evaluate(
                async ({ source, config, renderId, maxWidth }) => {
                    const mermaid = (
                        window as unknown as {
                            mermaid: typeof import('mermaid').default;
                        }
                    ).mermaid;
                    mermaid.initialize(config);
                    const { svg } = await mermaid.render(renderId, source);
                    const frame = document.getElementById('frame');
                    if (!frame) {
                        throw new Error('render frame missing');
                    }
                    frame.innerHTML = svg;
                    const element = frame.querySelector('svg');
                    if (!element) {
                        throw new Error('mermaid produced no svg');
                    }
                    // Mermaid caps the SVG at its natural width with an inline
                    // max-width; draw it at that width, scaled down to fit when
                    // it is wider than the article body.
                    const naturalWidth =
                        parseFloat(element.style.maxWidth) ||
                        element.viewBox.baseVal.width;
                    element.style.maxWidth = 'none';
                    element.style.width = `${Math.min(naturalWidth, maxWidth)}px`;
                    element.style.height = 'auto';
                    element.removeAttribute('height');
                },
                {
                    source: image.mermaidSource,
                    config: mermaidConfig(false),
                    renderId: `diagram-${index}`,
                    maxWidth: DIAGRAM_IMAGE_MAX_WIDTH,
                }
            );
            await page
                .locator('#frame')
                .screenshot({ path: diagramImageFilePath(image.key) });
            await page.close();
            console.log(
                `generate-diagram-images: drew ${image.key}.png (${image.alt})`
            );
        }

        await browser.close();
    }

    const usedFiles = new Set(images.map((image) => `${image.key}.png`));
    let removedCount = 0;
    for (const fileName of fs.readdirSync(DIAGRAM_IMAGE_DIRECTORY)) {
        if (fileName.endsWith('.png') && !usedFiles.has(fileName)) {
            fs.rmSync(path.join(DIAGRAM_IMAGE_DIRECTORY, fileName));
            removedCount += 1;
        }
    }

    console.log(
        `generate-diagram-images: ${images.length} diagram(s), ${pending.length} drawn, ` +
            `${images.length - pending.length} up to date, ${removedCount} removed`
    );
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
