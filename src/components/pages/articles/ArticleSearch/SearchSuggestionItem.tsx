import HighlightedText from '@/components/pages/articles/ArticleSearch/HighlightedText';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';
import type { ArticleSummary } from '@/lib/posts';

/**
 * One article row in the search suggestions dropdown. Selecting it opens the
 * article directly. The matched parts of the title and tags are highlighted so
 * it is obvious why the article surfaced.
 */
export default function SearchSuggestionItem({
    optionId,
    article,
    terms,
    active,
    onHighlight,
    onSelect,
}: {
    optionId: string;
    article: ArticleSummary;
    terms: string[];
    active: boolean;
    onHighlight: () => void;
    onSelect: () => void;
}) {
    return (
        <li
            id={optionId}
            role="option"
            aria-selected={active}
        >
            <button
                type="button"
                // Options are not in the tab order: focus stays on the input and
                // the combobox moves the active option via aria-activedescendant.
                tabIndex={-1}
                // Keep the input focused so the highlight does not reset before
                // the click is handled.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={onHighlight}
                onClick={onSelect}
                className={cn(
                    'flex w-full flex-col gap-1.5 rounded-xl px-3 py-2.5 text-left transition-colors',
                    active ? 'bg-foreground/[0.07]' : 'hover:bg-foreground/5'
                )}
            >
                <span className="text-foreground text-sm leading-snug font-medium">
                    <HighlightedText
                        text={article.title}
                        terms={terms}
                    />
                </span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-foreground/45 text-xs">
                        {formatDate(article.date)}
                    </span>
                    {article.tags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-foreground/[0.06] text-foreground/55 rounded-full px-2 py-0.5 text-[0.7rem]"
                        >
                            <HighlightedText
                                text={tag}
                                terms={terms}
                            />
                        </span>
                    ))}
                </span>
            </button>
        </li>
    );
}
