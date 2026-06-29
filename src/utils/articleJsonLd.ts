import { BlogPosting, WithContext } from 'schema-dts';
import { siteName, siteThumbnail, siteURL } from '@/config/constants';
import type { Article } from '@/lib/posts';

export function buildArticleJsonLd(article: Article): WithContext<BlogPosting> {
    const url = `${siteURL}/articles/${article.slug}`;
    // Tags plus the concrete stack make a richer keyword set than tags alone.
    const keywords = [...article.tags, ...article.tech];
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.description,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        datePublished: article.date,
        dateModified: article.updated ?? article.date,
        image: article.cover ? `${siteURL}${article.cover}` : siteThumbnail,
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
