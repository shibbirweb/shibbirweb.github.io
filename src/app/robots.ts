import type { MetadataRoute } from 'next';
import { sendMockSitemapURL, siteURL } from '@/config/constants';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        // SendMock is a separate app on this domain (/sendmock/). Search engines
        // only read robots.txt at the root, so its sitemap is listed here too.
        sitemap: [`${siteURL}/sitemap.xml`, sendMockSitemapURL],
    };
}
