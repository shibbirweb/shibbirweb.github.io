import ArticlesSearch from '@/components/pages/articles/ArticlesSearch';
import { getAllArticles } from '@/lib/posts';
import { siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';

const description = `Search the articles by ${siteName} by title or tag.`;

export const metadata = buildPageMetadata({
    title: 'Search Articles',
    description,
    path: '/articles/search',
    // Results pages are query-driven and thin, so keep them out of the index
    // while still letting crawlers follow through to the articles themselves.
    robots: { index: false, follow: true },
});

export default function ArticlesSearchPage() {
    return <ArticlesSearch articles={getAllArticles()} />;
}
