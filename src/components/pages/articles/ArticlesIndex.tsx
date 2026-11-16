import { Suspense } from 'react';
import PageTopBar from '@/components/pages/common/PageTopBar';
import ArticleSearch from '@/components/pages/articles/ArticleSearch';
import ArticlesIndexFallback from '@/components/pages/articles/ArticlesIndexFallback';
import ArticlesList from '@/components/pages/articles/ArticlesList';
import { buildSeriesTotals } from '@/utils/seriesTotals';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';

export default function ArticlesIndex({
    articles,
}: {
    articles: ArticleSummary[];
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
            <PageTopBar
                title="Articles"
                description="Real problems I ran into as a developer, and how I solved them."
                action={
                    <ArticleSearch
                        articles={articles}
                        className="shrink-0"
                    />
                }
            />

            <Suspense
                fallback={
                    <ArticlesIndexFallback
                        articles={articles}
                        seriesTotals={seriesTotals}
                        totalPages={totalPages}
                    />
                }
            >
                <ArticlesList
                    articles={articles}
                    perPage={ARTICLES_PER_PAGE}
                />
            </Suspense>
        </main>
    );
}
