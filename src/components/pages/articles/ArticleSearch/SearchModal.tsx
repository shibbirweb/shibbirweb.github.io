'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Search from '@/components/icons/search';
import Close from '@/components/icons/close';
import SearchSuggestions from '@/components/pages/articles/ArticleSearch/SearchSuggestions';
import { useArticleSearchBox } from '@/components/pages/articles/ArticleSearch/hooks/useArticleSearchBox';
import styles from '@/components/pages/articles/ArticleSearch/SearchModal.module.css';
import { cn } from '@/utils/cn';
import type { ArticleSummary } from '@/lib/posts';

/**
 * Command-palette style search over the pre-generated articles, shown above a
 * blurred backdrop. The input drives a debounced suggestion list (title and tag
 * hits highlighted); selecting one opens that article, while Enter or the search
 * row lands on the full results page. Mirrors the project's modal conventions
 * (portal, body scroll lock, Escape / backdrop dismiss, focus restore).
 */
export default function SearchModal({
    articles,
    initialQuery = '',
    onClose,
}: {
    articles: ArticleSummary[];
    initialQuery?: string;
    onClose: () => void;
}) {
    const box = useArticleSearchBox({ articles, initialQuery, onClose });
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxId = useId();
    const optionId = (index: number) => `${listboxId}-option-${index}`;
    const activeDescendant =
        box.activeIndex >= 0 ? optionId(box.activeIndex) : undefined;

    useEffect(() => {
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        inputRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [onClose]);

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Search articles"
            className={cn(
                styles.backdrop,
                'bg-background/60 fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] pb-4 backdrop-blur-md'
            )}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className={cn(
                    styles.panel,
                    'border-foreground/10 bg-background w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl'
                )}
            >
                <div className="border-foreground/10 flex items-center gap-3 border-b px-4 py-3.5">
                    <Search
                        aria-hidden="true"
                        className="text-foreground/40 size-5 shrink-0"
                    />
                    <input
                        ref={inputRef}
                        type="search"
                        role="combobox"
                        aria-label="Search articles"
                        aria-expanded={box.hasQuery}
                        aria-controls={listboxId}
                        aria-autocomplete="list"
                        aria-activedescendant={activeDescendant}
                        value={box.query}
                        onChange={box.onChange}
                        onKeyDown={box.onKeyDown}
                        placeholder="Search articles by title or tag..."
                        className="placeholder:text-foreground/40 w-full bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:appearance-none"
                    />
                    {box.query.length > 0 ? (
                        <button
                            type="button"
                            onClick={box.clear}
                            aria-label="Clear search"
                            className="text-foreground/40 hover:text-foreground hover:bg-foreground/10 grid size-7 shrink-0 place-items-center rounded-full transition-colors"
                        >
                            <Close className="size-4" />
                        </button>
                    ) : (
                        <kbd className="border-foreground/20 text-foreground/50 hidden shrink-0 rounded border px-1.5 py-0.5 text-[0.65rem] sm:inline-block">
                            Esc
                        </kbd>
                    )}
                </div>

                {box.hasQuery ? (
                    <SearchSuggestions
                        listboxId={listboxId}
                        optionId={optionId}
                        query={box.query}
                        terms={box.terms}
                        suggestions={box.suggestions}
                        activeIndex={box.activeIndex}
                        searchRowIndex={box.searchRowIndex}
                        searchRowActive={box.searchRowActive}
                        onHighlight={box.highlightOption}
                        onSelectArticle={box.goToArticle}
                        onSearchAll={box.goToResults}
                    />
                ) : (
                    <p className="text-foreground/50 px-4 py-6 text-sm">
                        Start typing to find an article by its title or a tag.
                    </p>
                )}
            </div>
        </div>,
        document.body
    );
}
