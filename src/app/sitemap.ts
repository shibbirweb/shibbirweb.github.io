import type { MetadataRoute } from 'next';
import { siteURL } from '@/config/constants';
import { articleOgImagePath } from '@/utils/generateArticleCover';
import { getAllArticles } from '@/lib/posts';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const articles = getAllArticles();

    const entries: MetadataRoute.Sitemap = [
        {
            url: siteURL,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1,
            images: [`${siteURL}/images/shibbir-ahmed.jpg`],
        },
        {
            url: `${siteURL}/uses`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${siteURL}/now`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${siteURL}/resume`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    if (articles.length === 0) return entries;

    entries.push({
        url: `${siteURL}/articles`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
    });

    for (const article of articles) {
        // A crawlable raster (the OG PNG for SVG covers, else the cover itself)
        // so the article's image is discoverable from the sitemap.
        const image = article.cover.endsWith('.svg')
            ? articleOgImagePath(article.slug)
            : article.cover;
        entries.push({
            url: `${siteURL}/articles/${article.slug}`,
            lastModified: new Date(
                `${article.updated ?? article.date}T00:00:00`
            ),
            changeFrequency: 'yearly',
            priority: 0.6,
            images: [`${siteURL}${image}`],
        });
    }

    return entries;
}
