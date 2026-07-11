import { getFeedData, renderRssFeed } from '@/lib/feed';

// Static export writes the response to out/feed.xml.
export const dynamic = 'force-static';

export async function GET() {
    const body = renderRssFeed(await getFeedData());
    return new Response(body, {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
}
