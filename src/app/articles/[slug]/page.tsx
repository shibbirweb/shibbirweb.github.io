import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Tag from '@/components/pages/common/Tag';
import { JsonLd } from '@/components/utils/JsonLd';
import { buildArticleJsonLd } from '@/utils/articleJsonLd';
import { formatDate } from '@/utils/formatDate';
import { getAllArticles, getArticle } from '@/lib/posts';

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
    const article = getArticle(slug);
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
    const article = getArticle(slug);
    if (!article) notFound();

    return (
        <main className="container mx-auto px-4 py-20 sm:py-28">
            <article className="mx-auto max-w-3xl">
                <header>
                    <p className="text-foreground/60 text-base">
                        <time dateTime={article.date}>
                            {formatDate(article.date)}
                        </time>
                        {' · '}
                        {article.readingMinutes} min read
                    </p>
                    <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                        {article.title}
                    </h1>
                    <ul className="mt-6 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                            <Tag
                                key={tag}
                                className="text-foreground/70 px-3 py-1 text-base"
                            >
                                {tag}
                            </Tag>
                        ))}
                    </ul>
                </header>

                <div
                    className="prose prose-lg dark:prose-invert mt-10 max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.html }}
                />

                <div className="mt-14">
                    <Link
                        href="/articles"
                        className="text-foreground/70 hover:text-foreground text-lg transition-colors"
                    >
                        Back to all articles
                    </Link>
                </div>
            </article>

            {process.env.NODE_ENV === 'production' && (
                <JsonLd data={buildArticleJsonLd(article)} />
            )}
        </main>
    );
}
