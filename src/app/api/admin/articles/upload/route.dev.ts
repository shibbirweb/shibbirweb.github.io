import { saveInlineImage, StudioError } from '@/lib/admin/articleStore';
import { handle } from '@/lib/admin/respond';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB is plenty for an inline article image.

/**
 * POST /api/admin/articles/upload (multipart) -> save an inline image into
 * public/images/articles/inline and return its public path for the image block.
 */
export function POST(request: Request): Promise<Response> {
    return handle(async () => {
        const form = await request.formData();
        const file = form.get('file');
        if (!(file instanceof File)) throw new StudioError('No file provided');
        if (file.size > MAX_BYTES)
            throw new StudioError('Image exceeds the 8 MB limit', 413);
        if (!file.type.startsWith('image/'))
            throw new StudioError('Only image files are allowed', 415);
        const buffer = Buffer.from(await file.arrayBuffer());
        return saveInlineImage(file.name || 'image.png', buffer);
    });
}
