// Build-time generation of article cover thumbnails. For every published
// article without a frontmatter `cover`, writes a deterministic SVG to
// public/images/articles/generated/<slug>.svg so it can serve both as the
// on-page cover and as the JSON-LD `image`. Runs before `next dev`/`next build`
// (see package.json). Stale files are pruned so a slug that later gains a real
// cover does not keep an orphan.

import fs from 'node:fs';
import path from 'node:path';
import { getAllArticles } from '@/lib/posts';
import {
    buildArticleCoverSvg,
    generatedCoverPath,
} from '@/utils/generateArticleCover';

const GENERATED_DIR = path.join(
    process.cwd(),
    'public/images/articles/generated'
);

function main(): void {
    // After toSummary's fallback, a cover-less article resolves to exactly its
    // generated path; an author-provided cover does not. That distinguishes the
    // two without re-reading frontmatter.
    const generated = getAllArticles().filter(
        (article) => article.cover === generatedCoverPath(article.slug)
    );

    fs.mkdirSync(GENERATED_DIR, { recursive: true });

    const expected = new Set(generated.map((article) => `${article.slug}.svg`));
    for (const file of fs.readdirSync(GENERATED_DIR)) {
        if (file.endsWith('.svg') && !expected.has(file)) {
            fs.rmSync(path.join(GENERATED_DIR, file));
        }
    }

    for (const article of generated) {
        const svg = buildArticleCoverSvg({
            slug: article.slug,
            title: article.title,
            tag: article.tags[0],
        });
        fs.writeFileSync(path.join(GENERATED_DIR, `${article.slug}.svg`), svg);
    }

    console.log(`Generated ${generated.length} article cover(s).`);
}

main();
