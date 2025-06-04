import type { MetadataRoute } from 'next';
import getConfig from 'next/config';

export const dynamic = 'force-static';

const { publicRuntimeConfig } = getConfig();

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: publicRuntimeConfig.siteURL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
    ];
}
