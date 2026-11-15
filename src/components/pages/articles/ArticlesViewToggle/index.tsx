'use client';

import ArticlesViewButton from '@/components/pages/articles/ArticlesViewToggle/ArticlesViewButton';
import { articlesViewOptions } from '@/components/pages/articles/ArticlesViewToggle/contents';
import { useArticlesView } from '@/components/pages/articles/hooks/useArticlesView';

/**
 * A two-segment pill that switches the articles page between the card grid and
 * the compact list. The choice is remembered in this browser (articlesView.ts).
 */
export default function ArticlesViewToggle() {
    const { view, setView } = useArticlesView();

    return (
        <div
            role="group"
            aria-label="Layout"
            className="border-foreground/15 inline-flex gap-0.5 rounded-full border p-0.5"
        >
            {articlesViewOptions.map((option) => (
                <ArticlesViewButton
                    key={option.view}
                    option={option}
                    pressed={view === option.view}
                    onSelect={() => setView(option.view)}
                />
            ))}
        </div>
    );
}
