import { Suspense } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SectionHeading from '@/components/pages/common/SectionHeading';
import ArticleSearch from '@/components/pages/articles/ArticleSearch';
import ArticlesIndexFallback from '@/components/pages/articles/ArticlesIndexFallback';
import ArticlesList from '@/components/pages/articles/ArticlesList';
import { buildSeriesTotals } from '@/utils/seriesTotals';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';

export default function ArticlesIndex({
    articles,
    tags,
}: {
    articles: ArticleSummary[];
    tags: string[];
}) {
    const totalPages = Math.max(
        1,
        Math.ceil(articles.length / ARTICLES_PER_PAGE)
    );
    const seriesTotals = buildSeriesTotals(articles);

    return (
        <main
            id="main"
            className="container mx-auto px-4 py-20 sm:py-28"
        >
            <Breadcrumb />
            <div className="flex items-start justify-between gap-4">
                <SectionHeading as="h1">Articles</SectionHeading>
                <ArticleSearch
                    articles={articles}
                    className="mt-1 shrink-0"
                />
            </div>
            <p className="text-foreground/70 mt-6 max-w-3xl text-lg leading-relaxed">
                Notes on backend engineering, AI, and self-hosted
                infrastructure.
            </p>

            <Suspense
                fallback={
                    <ArticlesIndexFallback
                        articles={articles}
                        tags={tags}
                        seriesTotals={seriesTotals}
                        totalPages={totalPages}
                    />
                }
            >
                <ArticlesList
                    articles={articles}
                    tags={tags}
                    perPage={ARTICLES_PER_PAGE}
                />
            </Suspense>
        </main>
    );
}
