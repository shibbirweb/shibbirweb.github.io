import {
    duplicateArticle,
    readArticle,
    saveArticle,
    setPublished,
    trashArticle,
    StudioError,
} from '@/lib/admin/articleStore';
import { handle, readJson, requireParam } from '@/lib/admin/respond';
import type { ArticleFrontmatter } from '@/lib/admin/types';

export const dynamic = 'force-dynamic';

/** GET /api/admin/articles/entry?id=... -> one article with body + raw. */
export function GET(request: Request): Promise<Response> {
    return handle(() => ({ article: readArticle(requireParam(request, 'id')) }));
}

/** PUT /api/admin/articles/entry -> persist edits (and rename on slug change). */
export function PUT(request: Request): Promise<Response> {
    return handle(async () => {
        const body = await readJson<{
            id?: string;
            frontmatter?: ArticleFrontmatter;
            content?: string;
            slug?: string;
        }>(request);
        if (!body.id) throw new StudioError('Missing article id');
        if (!body.frontmatter) throw new StudioError('Missing frontmatter');
        return saveArticle(body.id, {
            frontmatter: body.frontmatter,
            content: body.content ?? '',
            slug: body.slug,
        });
    });
}

/**
 * PATCH /api/admin/articles/entry -> a lifecycle action that does not change
 * the body: `publish`, `unpublish`, or `duplicate`.
 */
export function PATCH(request: Request): Promise<Response> {
    return handle(async () => {
        const body = await readJson<{ id?: string; action?: string }>(request);
        if (!body.id) throw new StudioError('Missing article id');
        switch (body.action) {
            case 'publish':
                return setPublished(body.id, true);
            case 'unpublish':
                return setPublished(body.id, false);
            case 'duplicate':
                return duplicateArticle(body.id);
            default:
                throw new StudioError(`Unknown action: ${body.action ?? ''}`);
        }
    });
}

/** DELETE /api/admin/articles/entry?id=... -> move into the recycle bin. */
export function DELETE(request: Request): Promise<Response> {
    return handle(() => trashArticle(requireParam(request, 'id')));
}
