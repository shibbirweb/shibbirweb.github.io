import type { MetadataRoute } from 'next';
import getConfig from 'next/config';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    const { publicRuntimeConfig } = getConfig();
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/',
        },
        sitemap: publicRuntimeConfig.sitemapURL,
    };
}
