import ArticlesIndex from '@/components/pages/articles/ArticlesIndex';
import { getAllArticles } from '@/lib/posts';
import { siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';

const description = `Real problems from ${siteName}'s work as a developer, and how they were solved.`;

export const metadata = buildPageMetadata({
    title: 'Articles',
    description,
    path: '/articles',
});

export default function ArticlesPage() {
    return <ArticlesIndex articles={getAllArticles()} />;
}
