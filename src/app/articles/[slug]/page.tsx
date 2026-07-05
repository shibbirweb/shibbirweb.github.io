import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleView from '@/components/pages/articles/ArticleView';
import {
    siteAuthor,
    siteLocale,
    siteName,
    siteURL,
    twitterUsername,
} from '@/config/constants';
import { articleOgImagePath } from '@/utils/generateArticleCover';
import {
    getAdjacentArticles,
    getAllArticles,
    getArticle,
    getRelatedArticles,
    getSeriesForArticle,
} from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
    const articles = getAllArticles();
    // Static export needs at least one param; a placeholder keeps the build
    // working when there are no articles yet (it resolves to notFound()).
    if (articles.length === 0) return [{ slug: '__no-articles__' }];
    return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticle(slug);
    if (!article) return {};
    // SVG covers are not rendered by social crawlers, so point at the raster PNG
    // that generate-og-images.ts produces; a raster cover is already OG-safe.
    const ogImage = article.cover.endsWith('.svg')
        ? articleOgImagePath(slug)
        : article.cover;
    return {
        title: article.title,
        description: article.description,
        keywords: [...new Set([...article.tags, ...article.tech])],
        authors: [{ name: siteAuthor, url: siteURL }],
        alternates: { canonical: `/articles/${slug}` },
        openGraph: {
            title: article.title,
            description: article.description,
            url: `/articles/${slug}`,
            siteName,
            locale: siteLocale,
            type: 'article',
            publishedTime: article.date,
            modifiedTime: article.updated ?? article.date,
            authors: [siteURL],
            ...(article.category && { section: article.category }),
            tags: article.tags,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: article.title,
                    type: 'image/png',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.description,
            creator: twitterUsername,
            images: [ogImage],
        },
    };
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const article = await getArticle(slug);
    if (!article) notFound();

    const related = getRelatedArticles(slug, 3);
    const series = getSeriesForArticle(slug);
    const { previous, next } = getAdjacentArticles(slug);

    return (
        <ArticleView
            article={article}
            related={related}
            series={series}
            previous={previous}
            next={next}
        />
    );
}
