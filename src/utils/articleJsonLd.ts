import { BlogPosting, WithContext } from 'schema-dts';
import { siteName, siteThumbnail, siteURL } from '@/config/constants';
import { articleOgImagePath } from '@/utils/generateArticleCover';
import type { Article } from '@/lib/posts';

/** Approximate word count from rendered HTML (tags stripped). */
function countWords(html: string): number {
    const text = html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return text ? text.split(' ').length : 0;
}

export function buildArticleJsonLd(article: Article): WithContext<BlogPosting> {
    const url = `${siteURL}/articles/${article.slug}`;
    // Tags plus the concrete stack make a richer keyword set than tags alone.
    const keywords = [...new Set([...article.tags, ...article.tech])];
    // Structured-data images should be crawlable rasters, so mirror the OG image:
    // the PNG for SVG covers, the cover itself when it is already a raster.
    const image = article.cover
        ? `${siteURL}${article.cover.endsWith('.svg') ? articleOgImagePath(article.slug) : article.cover}`
        : siteThumbnail;
    const wordCount = countWords(article.html);
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.description,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        datePublished: article.date,
        dateModified: article.updated ?? article.date,
        image,
        inLanguage: 'en',
        timeRequired: `PT${article.readingMinutes}M`,
        ...(wordCount > 0 && { wordCount }),
        ...(keywords.length > 0 && { keywords: keywords.join(', ') }),
        ...(article.category && { articleSection: article.category }),
        author: {
            '@type': 'Person',
            '@id': `${siteURL}#person`,
            name: siteName,
            url: siteURL,
        },
        publisher: {
            '@type': 'Person',
            '@id': `${siteURL}#person`,
            name: siteName,
        },
    };
}
