import Search from '@/components/icons/search';
import SearchSuggestionItem from '@/components/pages/articles/ArticleSearch/SearchSuggestionItem';
import { cn } from '@/utils/cn';
import type { ArticleSummary } from '@/lib/posts';

/**
 * The results list inside the search modal: matching articles followed by a
 * "search everything" row that opens the full results page. The article rows and
 * the search row share one option index space (the search row is `searchRowIndex`)
 * so a single highlighted index drives keyboard selection.
 */
export default function SearchSuggestions({
    listboxId,
    optionId,
    query,
    terms,
    suggestions,
    activeIndex,
    searchRowIndex,
    searchRowActive,
    onHighlight,
    onSelectArticle,
    onSearchAll,
}: {
    listboxId: string;
    optionId: (index: number) => string;
    query: string;
    terms: string[];
    suggestions: ArticleSummary[];
    activeIndex: number;
    searchRowIndex: number;
    searchRowActive: boolean;
    onHighlight: (index: number) => void;
    onSelectArticle: (slug: string) => void;
    onSearchAll: () => void;
}) {
    const trimmed = query.trim();

    return (
        <ul
            id={listboxId}
            role="listbox"
            aria-label="Article suggestions"
            className="max-h-[min(60vh,26rem)] overflow-y-auto p-2"
        >
            {suggestions.length === 0 && (
                <li
                    role="presentation"
                    className="text-foreground/60 px-3 py-2 text-sm"
                >
                    No titles or tags match. Try the full search below.
                </li>
            )}

            {suggestions.map((article, index) => (
                <SearchSuggestionItem
                    key={article.slug}
                    optionId={optionId(index)}
                    article={article}
                    terms={terms}
                    active={index === activeIndex}
                    onHighlight={() => onHighlight(index)}
                    onSelect={() => onSelectArticle(article.slug)}
                />
            ))}

            <li
                id={optionId(searchRowIndex)}
                role="option"
                aria-selected={searchRowActive}
                className={cn(
                    suggestions.length > 0 && 'border-foreground/10 mt-1 border-t pt-1'
                )}
            >
                <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => onHighlight(searchRowIndex)}
                    onClick={onSearchAll}
                    className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                        searchRowActive
                            ? 'bg-foreground/[0.07]'
                            : 'hover:bg-foreground/5'
                    )}
                >
                    <Search
                        aria-hidden="true"
                        className="text-foreground/70 size-4 shrink-0"
                    />
                    <span className="text-foreground/70 min-w-0 truncate">
                        Search for{' '}
                        <span className="text-foreground font-medium">
                            “{trimmed}”
                        </span>
                    </span>
                    <kbd className="border-foreground/20 text-foreground/70 ml-auto hidden shrink-0 rounded border px-1.5 py-0.5 text-[0.65rem] sm:inline-block">
                        Enter
                    </kbd>
                </button>
            </li>
        </ul>
    );
}
