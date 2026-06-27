import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleContent from '../ArticleContent';
import ArticleCover from '../ArticleCover';
import ArticleGrid from '../ArticleGrid';
import TagLink from '../TagLink';
import { JsonLd } from '@/components/utils/JsonLd';
import { buildArticleJsonLd } from '@/utils/articleJsonLd';
import { formatDate } from '@/utils/formatDate';
import { getAllArticles, getArticle, getRelatedArticles } from '@/lib/posts';

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

    const related = getRelatedArticles(slug, 4);

    const header = (
        <header>
            <p className="text-foreground/60 text-base">
                <time dateTime={article.date}>{formatDate(article.date)}</time>
                {' · '}
                {article.readingMinutes} min read
            </p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                {article.title}
            </h1>
            <ul className="mt-6 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                    <TagLink
                        key={tag}
                        tag={tag}
                        className="px-3 py-1 text-base"
                    />
                ))}
            </ul>
            {article.description && (
                <p className="text-foreground/80 mt-6 text-2xl leading-relaxed">
                    {article.description}
                </p>
            )}
        </header>
    );

    return (
        <main className="container mx-auto px-4 py-20 sm:py-28">
            <article>
                {article.cover ? (
                    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                        <ArticleCover
                            src={article.cover}
                            className="h-auto rounded-2xl"
                        />
                        {header}
                    </div>
                ) : (
                    header
                )}

                <div className="via-foreground/50 mt-12 h-px bg-linear-to-r from-transparent to-transparent" />

                <ArticleContent html={article.html} />

                <div className="mt-14">
                    <Link
                        href="/articles"
                        className="text-foreground/70 hover:text-foreground text-lg transition-colors"
                    >
                        Back to all articles
                    </Link>
                </div>
            </article>

            {related.length > 0 && (
                <aside
                    aria-label="Related articles"
                    className="border-foreground/10 mt-20 border-t pt-12"
                >
                    <h2 className="text-2xl font-bold sm:text-3xl">
                        Related articles
                    </h2>
                    <ArticleGrid
                        articles={related}
                        compact
                        className="mt-10 lg:grid-cols-4"
                    />
                </aside>
            )}

            {process.env.NODE_ENV === 'production' && (
                <JsonLd data={buildArticleJsonLd(article)} />
            )}
        </main>
    );
}
