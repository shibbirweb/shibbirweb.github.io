import { Suspense } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SectionHeading from '@/components/pages/common/SectionHeading';
import ArticleGrid from '@/components/pages/articles/ArticleGrid';
import ArticleSearch from '@/components/pages/articles/ArticleSearch';
import ArticlesList from '@/components/pages/articles/ArticlesList';
import Pagination from '@/components/pages/articles/Pagination';
import TagFilter from '@/components/pages/articles/TagFilter';
import { buildPageHref } from '@/utils/pageHref';
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
                    <>
                        <TagFilter
                            tags={tags}
                            active={null}
                        />
                        <ArticleGrid
                            articles={articles.slice(0, ARTICLES_PER_PAGE)}
                            seriesTotals={seriesTotals}
                        />
                        <Pagination
                            current={1}
                            total={totalPages}
                            createHref={(page) =>
                                buildPageHref(
                                    '/articles',
                                    new URLSearchParams(),
                                    page
                                )
                            }
                        />
                    </>
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
