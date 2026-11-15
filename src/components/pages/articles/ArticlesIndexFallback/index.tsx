import ArticleCount from '@/components/pages/articles/ArticleCount';
import ArticleGrid from '@/components/pages/articles/ArticleGrid';
import styles from '@/components/pages/articles/ArticlesIndexFallback/ArticlesIndexFallback.module.css';
import ArticlesToolbar from '@/components/pages/articles/ArticlesToolbar';
import Pagination from '@/components/pages/articles/Pagination';
import TagFilter from '@/components/pages/articles/TagFilter';
import { buildPageHref } from '@/utils/pageHref';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';
import type { SeriesTotals } from '@/utils/seriesTotals';

/**
 * The articles index as pre-rendered into the static HTML, shown until the
 * client-side ArticlesList (which reads ?tag= and ?page=) takes over: every tag,
 * then the first page in the default grid. The results part is hidden for a
 * visitor whose saved layout is the list (ArticlesIndexFallback.module.css).
 */
export default function ArticlesIndexFallback({
    articles,
    tags,
    seriesTotals,
    totalPages,
}: {
    articles: ArticleSummary[];
    tags: string[];
    seriesTotals: SeriesTotals;
    totalPages: number;
}) {
    return (
        <>
            <TagFilter
                tags={tags}
                active={null}
            />
            <div className={styles.pendingResults}>
                <ArticlesToolbar
                    summary={<ArticleCount count={articles.length} />}
                />
                <ArticleGrid
                    articles={articles.slice(0, ARTICLES_PER_PAGE)}
                    seriesTotals={seriesTotals}
                    className="mt-6"
                />
                <Pagination
                    current={1}
                    total={totalPages}
                    createHref={(page) =>
                        buildPageHref('/articles', new URLSearchParams(), page)
                    }
                />
            </div>
        </>
    );
}
