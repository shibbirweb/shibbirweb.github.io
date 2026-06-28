import type { Metadata } from 'next';
import ArticlesIndex from '@/components/pages/articles/ArticlesIndex';
import { getAllArticles, getAllTags } from '@/lib/posts';
import { siteName } from '@/config/constants';

const description =
    'Notes on backend engineering, AI, and self-hosted infrastructure by ' +
    `${siteName}.`;

export const metadata: Metadata = {
    title: 'Articles',
    description,
    alternates: { canonical: '/articles' },
    openGraph: {
        title: `Articles | ${siteName}`,
        description,
        url: '/articles',
        type: 'website',
    },
};

export default function ArticlesPage() {
    return (
        <ArticlesIndex
            articles={getAllArticles()}
            tags={getAllTags()}
        />
    );
}
