import ArticlesIndex from '@/components/pages/articles/ArticlesIndex';
import { getAllArticles, getAllTags } from '@/lib/posts';
import { siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';

const description =
    'Notes on backend engineering, AI, and self-hosted infrastructure by ' +
    `${siteName}.`;

export const metadata = buildPageMetadata({
    title: 'Articles',
    description,
    path: '/articles',
});

export default function ArticlesPage() {
    return (
        <ArticlesIndex
            articles={getAllArticles()}
            tags={getAllTags()}
        />
    );
}
