'use client';

import ArticleGrid, {
    firstRowCoverCount,
} from '@/components/pages/articles/ArticleGrid';
import ArticleRowList from '@/components/pages/articles/ArticleRowList';
import { useArticlesView } from '@/components/pages/articles/hooks/useArticlesView';
import type { SeriesTotals } from '@/utils/seriesTotals';
import type { ArticleSummary } from '@/lib/posts';

/**
 * One page of articles in the layout the visitor picked with the toolbar
 * toggle: the compact row list (default) or the card grid.
 */
export default function ArticlesResults({
    articles,
    seriesTotals,
}: {
    articles: ArticleSummary[];
    seriesTotals: SeriesTotals;
}) {
    const { view } = useArticlesView();

    return view === 'list' ? (
        <ArticleRowList
            articles={articles}
            seriesTotals={seriesTotals}
        />
    ) : (
        <ArticleGrid
            articles={articles}
            seriesTotals={seriesTotals}
            className="mt-6"
            eagerCoverCount={firstRowCoverCount}
        />
    );
}
