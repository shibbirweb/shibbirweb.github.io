import ArticleCount from '@/components/pages/articles/ArticleCount';
import styles from '@/components/pages/articles/ArticlesIndexFallback/ArticlesIndexFallback.module.css';
import ArticleRowList from '@/components/pages/articles/ArticleRowList';
import ArticlesToolbar from '@/components/pages/articles/ArticlesToolbar';
import Pagination from '@/components/pages/articles/Pagination';
import ArticlesBrowse from '@/components/pages/articles/ArticlesBrowse';
import { buildPageHref } from '@/utils/pageHref';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';
import type { SeriesTotals } from '@/utils/seriesTotals';

/**
 * The articles index as pre-rendered into the static HTML, shown until the
 * client-side ArticlesList (which reads ?tag= and ?page=) takes over: the
 * browse bar, then the first page in the default list. The results part is
 * hidden for a visitor whose saved layout is the grid
 * (ArticlesIndexFallback.module.css).
 */
export default function ArticlesIndexFallback({
    articles,
    seriesTotals,
    totalPages,
}: {
    articles: ArticleSummary[];
    seriesTotals: SeriesTotals;
    totalPages: number;
}) {
    return (
        <>
            <ArticlesBrowse
                articles={articles}
                activeTag={null}
            />
            <div className={styles.pendingResults}>
                <h2 className="sr-only">Article list</h2>
                <ArticlesToolbar
                    summary={<ArticleCount count={articles.length} />}
                />
                <ArticleRowList
                    articles={articles.slice(0, ARTICLES_PER_PAGE)}
                    seriesTotals={seriesTotals}
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
