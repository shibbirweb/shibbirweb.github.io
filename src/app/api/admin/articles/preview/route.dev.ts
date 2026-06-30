import { renderArticleMarkdown } from '@/lib/posts';
import { handle, readJson } from '@/lib/admin/respond';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/articles/preview -> render arbitrary article body Markdown
 * through the exact production pipeline (Shiki, gists, Mermaid placeholders,
 * heading anchors + TOC), so the editor preview matches a published page.
 */
export function POST(request: Request): Promise<Response> {
    return handle(async () => {
        const body = await readJson<{ content?: string }>(request);
        const { html, toc } = await renderArticleMarkdown(body.content ?? '');
        return { html, toc };
    });
}
