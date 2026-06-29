'use client';

import SearchTrigger from '@/components/pages/articles/ArticleSearch/SearchTrigger';
import SearchModal from '@/components/pages/articles/ArticleSearch/SearchModal';
import { useSearchModal } from '@/components/pages/articles/ArticleSearch/hooks/useSearchModal';
import type { ArticleSummary } from '@/lib/posts';

/**
 * Article search entry point: a search-icon trigger (also bound to Cmd/Ctrl+K)
 * that opens a command-palette style modal over the pre-generated articles. The
 * modal is only mounted while open. `initialQuery` pre-fills it on the results
 * page so the active search can be refined.
 */
export default function ArticleSearch({
    articles,
    initialQuery = '',
    className,
}: {
    articles: ArticleSummary[];
    initialQuery?: string;
    className?: string;
}) {
    const { open, show, close } = useSearchModal();

    return (
        <>
            <SearchTrigger
                onClick={show}
                className={className}
            />
            {open && (
                <SearchModal
                    articles={articles}
                    initialQuery={initialQuery}
                    onClose={close}
                />
            )}
        </>
    );
}
