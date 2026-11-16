import { Suspense } from 'react';
import PageTopBar from '@/components/pages/common/PageTopBar';
import ArticleSearch from '@/components/pages/articles/ArticleSearch';
import QueryArticleSearch from '@/components/pages/articles/SearchResults/QueryArticleSearch';
import SearchResults from '@/components/pages/articles/SearchResults';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';

/**
 * Layout for the /articles/search results page: the same top as the articles
 * index (breadcrumb with the search button beside it, the heading and intro kept
 * for screen readers), then the results. The query lives in the URL and is read
 * client-side, so the parts that read it sit inside Suspense boundaries
 * (required for useSearchParams under static export).
 */
export default function ArticlesSearch({
    articles,
}: {
    articles: ArticleSummary[];
}) {
    return (
        <main
            id="main"
            className="container mx-auto px-4 py-20 sm:py-28"
        >
            <PageTopBar
                title="Search articles"
                description="Find an article by its title or a tag."
                action={
                    <Suspense
                        fallback={
                            <ArticleSearch
                                articles={articles}
                                className="shrink-0"
                            />
                        }
                    >
                        <QueryArticleSearch
                            articles={articles}
                            className="shrink-0"
                        />
                    </Suspense>
                }
            />

            <Suspense fallback={null}>
                <SearchResults
                    articles={articles}
                    perPage={ARTICLES_PER_PAGE}
                />
            </Suspense>
        </main>
    );
}
