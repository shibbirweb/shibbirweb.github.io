import type { MetadataRoute } from 'next';
import getConfig from 'next/config';

export const dynamic = 'force-static';

const { publicRuntimeConfig } = getConfig();

export default function sitemap(): MetadataRoute.Sitemap {
    const siteURL: string = publicRuntimeConfig.siteURL;
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
