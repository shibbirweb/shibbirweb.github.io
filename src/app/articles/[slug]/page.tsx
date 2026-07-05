import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleView from '@/components/pages/articles/ArticleView';
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
    return {
        title: article.title,
        description: article.description,
        alternates: { canonical: `/articles/${slug}` },
        openGraph: {
            title: article.title,
            description: article.description,
            url: `/articles/${slug}`,
            type: 'article',
            publishedTime: article.date,
            modifiedTime: article.updated ?? article.date,
            tags: article.tags,
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
