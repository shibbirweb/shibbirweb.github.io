import { getFeedData, renderAtomFeed } from '@/lib/feed';

// Static export writes the response to out/atom.xml.
export const dynamic = 'force-static';

export async function GET() {
    const body = renderAtomFeed(await getFeedData());
    return new Response(body, {
        headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
    });
}
