import { Suspense } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SectionHeading from '@/components/pages/common/SectionHeading';
import SearchResults from '@/components/pages/articles/SearchResults';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';

/**
 * Layout for the /articles/search results page. The query lives in the URL and
 * is read client-side, so the searchable results sit inside a Suspense boundary
 * (required for useSearchParams under static export).
 */
export default function ArticlesSearch({
    articles,
}: {
    articles: ArticleSummary[];
}) {
    return (
        <main className="container mx-auto px-4 py-20 sm:py-28">
            <Breadcrumb />
            <SectionHeading as="h1">Search articles</SectionHeading>
            <p className="text-foreground/70 mt-6 max-w-3xl text-lg leading-relaxed">
                Find an article by its title or a tag.
            </p>

            <Suspense fallback={null}>
                <SearchResults
                    articles={articles}
                    perPage={ARTICLES_PER_PAGE}
                />
            </Suspense>
        </main>
    );
}
