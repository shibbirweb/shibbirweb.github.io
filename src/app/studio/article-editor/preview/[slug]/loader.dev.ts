import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { buildArticle, type Article } from '@/lib/posts';

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
        return buildArticle(slug, data, content);
    }
    return null;
}
