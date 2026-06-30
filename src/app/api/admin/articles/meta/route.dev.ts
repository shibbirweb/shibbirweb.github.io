import { getMeta } from '@/lib/admin/articleStore';
import { handle } from '@/lib/admin/respond';

export const dynamic = 'force-dynamic';

/** GET /api/admin/articles/meta -> tag / category / series suggestions. */
export function GET(): Promise<Response> {
    return handle(() => getMeta());
}
