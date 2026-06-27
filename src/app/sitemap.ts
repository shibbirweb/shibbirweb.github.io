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
            images: [`${siteURL}/images/shibbir-ahmed.jpg`],
        },
        {
            url: `${siteURL}/uses`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${siteURL}/now`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];
}
