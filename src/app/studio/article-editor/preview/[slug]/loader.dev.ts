import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { buildArticle, type Article } from '@/lib/posts';
import {
    buildArticleCoverSvg,
    generatedCoverPath,
} from '@/utils/generateArticleCover';

// Dev-only loader for the editor's full-page preview. Reads a single article by
// slug from either content folder (published or draft) and builds it through the
// exact same `buildArticle` pipeline the production site uses, so the preview
// matches what ships. Imported only by the `.dev` preview route, so it never
// enters the export build.

const CONTENT_DIRECTORY = path.join(process.cwd(), 'content');
const FOLDERS = [
    path.join(CONTENT_DIRECTORY, 'articles'),
    path.join(CONTENT_DIRECTORY, 'article_drafts'),
];
const GENERATED_COVER_DIRECTORY = path.join(
    process.cwd(),
    'public/images/articles/generated'
);

/**
 * A cover-less article resolves to its generated SVG path, but that file is only
 * pre-generated for published articles (scripts/generate-covers.ts, which also
 * prunes non-published slugs). So for a draft or not-yet-published article, write
 * the same deterministic SVG on demand into public/ so the preview cover loads,
 * matching what the article will get once published.
 */
function ensureGeneratedCover(article: Article): void {
    if (article.cover !== generatedCoverPath(article.slug)) return;
    const file = path.join(GENERATED_COVER_DIRECTORY, `${article.slug}.svg`);
    if (fs.existsSync(file)) return;
    fs.mkdirSync(GENERATED_COVER_DIRECTORY, { recursive: true });
    fs.writeFileSync(
        file,
        buildArticleCoverSvg({
            slug: article.slug,
            title: article.title,
            tag: article.tags[0],
        })
    );
}

/** The article for `slug` from either folder, or null when no file matches. */
export async function loadPreviewArticle(slug: string): Promise<Article | null> {
    for (const directory of FOLDERS) {
        if (!fs.existsSync(directory)) continue;
        const file = fs
            .readdirSync(directory)
            .find(
                (name) =>
                    (name.endsWith('.md') || name.endsWith('.mdx')) &&
                    name.replace(/\.mdx?$/, '').replace(/^\d+-/, '') === slug
            );
        if (!file) continue;
        const raw = fs.readFileSync(path.join(directory, file), 'utf8');
        const { data, content } = matter(raw);
        const article = await buildArticle(slug, data, content);
        ensureGeneratedCover(article);
        return article;
    }
    return null;
}
