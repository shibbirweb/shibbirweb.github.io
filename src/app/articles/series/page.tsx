import SeriesIndex from '@/components/pages/articles/SeriesIndex';
import { getAllArticlesWithStack } from '@/lib/posts';
import { siteName } from '@/config/constants';
import { buildPageMetadata } from '@/utils/pageMetadata';
import { buildSeriesShelf } from '@/utils/seriesShelf';

const description = `Multi-part guides by ${siteName}, each meant to be read in order.`;

export const metadata = buildPageMetadata({
    title: 'Article Series',
    description,
    path: '/articles/series',
});

export default function ArticleSeriesPage() {
    return <SeriesIndex series={buildSeriesShelf(getAllArticlesWithStack())} />;
}
