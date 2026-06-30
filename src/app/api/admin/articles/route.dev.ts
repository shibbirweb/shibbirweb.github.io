import { createArticle, listArticles } from '@/lib/admin/articleStore';
import { handle, readJson } from '@/lib/admin/respond';

export const dynamic = 'force-dynamic';

/** GET /api/admin/articles -> every article across published + drafts. */
export function GET(): Promise<Response> {
    return handle(() => ({ articles: listArticles() }));
}

/** POST /api/admin/articles -> create a blank draft, returns its id. */
export function POST(request: Request): Promise<Response> {
    return handle(async () => {
        const body = await readJson<{ title?: string }>(request);
        return createArticle({ title: body.title });
    });
}
