import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/layout/Breadcrumb';
import ArticleContent from '@/components/pages/articles/ArticleContent';
import ArticleCover from '@/components/pages/articles/ArticleCover';
import ArticleGrid from '@/components/pages/articles/ArticleGrid';
import ArticleMeta from '@/components/pages/articles/ArticleMeta';
import ArticlePager from '@/components/pages/articles/ArticlePager';
import ImageLightbox from '@/components/pages/articles/ImageLightbox';
import ReadingProgress from '@/components/pages/articles/ReadingProgress';
import SeriesNav from '@/components/pages/articles/SeriesNav';
import TableOfContents from '@/components/pages/articles/TableOfContents';
import MobileTableOfContents from '@/components/pages/articles/TableOfContents/MobileTableOfContents';
import TagLink from '@/components/pages/articles/TagLink';
import TechStack from '@/components/pages/articles/TechStack';
import WhatYoullLearn from '@/components/pages/articles/WhatYoullLearn';
import MermaidRenderer from '@/components/pages/articles/MermaidRenderer';
import CodeBlockCopy from '@/components/pages/articles/CodeBlock';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildArticleJsonLd } from '@/utils/articleJsonLd';
import { jetBrainsMono } from '@/config/monoFont';
import { cn } from '@/utils/cn';
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

    const related = getRelatedArticles(slug, 4);
    const series = getSeriesForArticle(slug);
    const { previous, next } = getAdjacentArticles(slug);

    return (
        <main
            className={cn(
                jetBrainsMono.variable,
                'container mx-auto px-4 py-20 sm:py-28'
            )}
        >
            <ReadingProgress accentColors={article.coverColors} />
            <Breadcrumb currentName={article.title} />

            <article>
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                    <ArticleCover
                        src={article.cover}
                        className="h-auto rounded-2xl"
                    />
                    <header>
                        <ArticleMeta
                            date={article.date}
                            updated={article.updated}
                            readingMinutes={article.readingMinutes}
                            difficulty={article.difficulty}
                        />
                        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                            {article.title}
                        </h1>
                        {article.description && (
                            <p className="text-foreground/80 mt-5 text-lg leading-relaxed">
                                {article.description}
                            </p>
                        )}
                        <ul className="mt-6 flex flex-wrap gap-2">
                            {article.tags.map((tag) => (
                                <TagLink
                                    key={tag}
                                    tag={tag}
                                    className="px-3 py-1 text-sm"
                                />
                            ))}
                        </ul>
                        {article.tech.length > 0 && (
                            <TechStack
                                tech={article.tech}
                                className="mt-5"
                            />
                        )}
                    </header>
                </div>

                <div className="via-foreground/50 mt-12 h-px bg-linear-to-r from-transparent to-transparent" />

                <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12 xl:gap-16">
                    <div className="min-w-0">
                        {series && (
                            <SeriesNav
                                series={series}
                                currentSlug={slug}
                                accentColors={article.coverColors}
                                className="mb-8"
                            />
                        )}
                        {article.learn.length > 0 && (
                            <WhatYoullLearn
                                items={article.learn}
                                accentColors={article.coverColors}
                                className="mb-8"
                            />
                        )}
                        <MobileTableOfContents
                            toc={article.toc}
                            accentColors={article.coverColors}
                        />

                        <ArticleContent html={article.html} />

                        <MermaidRenderer />
                        <CodeBlockCopy />
                        <ImageLightbox />

                        <ArticlePager
                            previous={previous}
                            next={next}
                        />
                    </div>

                    <aside className="hidden lg:block">
                        <TableOfContents
                            toc={article.toc}
                            accentColors={article.coverColors}
                        />
                    </aside>
                </div>
            </article>

            {related.length > 0 && (
                <aside
                    aria-label="Related articles"
                    className="border-foreground/10 mt-20 border-t pt-12"
                >
                    <h2 className="text-xl font-bold sm:text-2xl">
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
