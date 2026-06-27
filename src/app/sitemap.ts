import type { MetadataRoute } from 'next';
import { siteURL } from '@/config/constants';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: siteURL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
            images: [`${siteURL}/shibbir-ahmed.jpg`],
        },
    ];
}
