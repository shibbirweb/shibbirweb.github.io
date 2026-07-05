// Build-time rasterisation of article OpenGraph images. Social crawlers
// (Twitter/X, Facebook, LinkedIn, Slack, Discord, iMessage) do not render SVG,
// so for every article whose cover is an SVG this rasterises it to a 1200x630
// PNG at public/og/articles/<slug>.png. generateMetadata and the article JSON-LD
// point at that PNG via articleOgImagePath, so link previews and structured-data
// images are real rasters. Runs after generate-covers (so generated SVGs exist)
// in the production build only (see package.json); the PNGs are gitignored and
// regenerated on every CI build. Stale files are pruned so a removed or renamed
// article does not leave an orphan.

import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { getAllArticles } from '@/lib/posts';
import { articleOgImagePath } from '@/utils/generateArticleCover';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'og/articles');
const FONTS_DIR = path.join(process.cwd(), 'scripts/assets/fonts');

// Bundled Noto Sans (the site's body font) so text renders identically on every
// machine and in CI. The covers reference `system-ui, sans-serif`; mapping both
// the default and sans-serif families to Noto Sans resolves those to real glyphs
// without depending on whatever fonts the build host happens to have installed.
const FONT_FILES = [
    'NotoSans-Regular.ttf',
    'NotoSans-SemiBold.ttf',
    'NotoSans-Bold.ttf',
].map((file) => path.join(FONTS_DIR, file));

function outputFileName(slug: string): string {
    return path.basename(articleOgImagePath(slug));
}

function main(): void {
    const articles = getAllArticles();
    // Only SVG covers need rasterising; a raster cover is already OG-safe and is
    // referenced directly by generateMetadata.
    const svgCovered = articles.filter((article) =>
        article.cover.endsWith('.svg')
    );

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const expected = new Set(
        svgCovered.map((article) => outputFileName(article.slug))
    );
    for (const file of fs.readdirSync(OUTPUT_DIR)) {
        if (file.endsWith('.png') && !expected.has(file)) {
            fs.rmSync(path.join(OUTPUT_DIR, file));
        }
    }

    for (const article of svgCovered) {
        const svgPath = path.join(PUBLIC_DIR, article.cover);
        const svg = fs.readFileSync(svgPath);
        const resvg = new Resvg(svg, {
            fitTo: { mode: 'width', value: 1200 },
            font: {
                fontFiles: FONT_FILES,
                loadSystemFonts: false,
                defaultFontFamily: 'Noto Sans',
                sansSerifFamily: 'Noto Sans',
            },
        });
        const png = resvg.render().asPng();
        fs.writeFileSync(
            path.join(OUTPUT_DIR, outputFileName(article.slug)),
            png
        );
    }

    console.log(`Generated ${svgCovered.length} article OG image(s).`);
}

main();
