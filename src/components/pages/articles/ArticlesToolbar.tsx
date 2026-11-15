import ArticlesViewToggle from '@/components/pages/articles/ArticlesViewToggle';
import type { ReactNode } from 'react';

/**
 * The row above a set of article results: a summary on the left (the article
 * count on the index, the "found for" line on search) and the grid/list layout
 * toggle on the right.
 */
export default function ArticlesToolbar({ summary }: { summary: ReactNode }) {
    return (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            {summary}
            <ArticlesViewToggle />
        </div>
    );
}
