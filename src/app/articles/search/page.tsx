import type { Metadata } from 'next';
import ArticlesSearch from '@/components/pages/articles/ArticlesSearch';
import { getAllArticles } from '@/lib/posts';
import { siteName } from '@/config/constants';

const description = `Search the articles by ${siteName} by title or tag.`;

export const metadata: Metadata = {
    title: 'Search Articles',
    description,
    alternates: { canonical: '/articles/search' },
    // Results pages are query-driven and thin, so keep them out of the index
    // while still letting crawlers follow through to the articles themselves.
    robots: { index: false, follow: true },
    openGraph: {
        title: `Search Articles | ${siteName}`,
        description,
        url: '/articles/search',
        type: 'website',
    },
};

export default function ArticlesSearchPage() {
    return <ArticlesSearch articles={getAllArticles()} />;
}
