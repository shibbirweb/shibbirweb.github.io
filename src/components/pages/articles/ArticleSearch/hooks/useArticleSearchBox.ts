import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { searchArticles, searchTerms } from '@/utils/searchArticles';
import { useDebouncedValue } from '@/components/pages/articles/ArticleSearch/hooks/useDebouncedValue';
import type { ArticleSummary } from '@/lib/posts';

const MAX_SUGGESTIONS = 6;
const DEBOUNCE_MS = 160;

/** URL of the search results page for a given query. */
export function searchResultsHref(query: string): string {
    return `/articles/search?q=${encodeURIComponent(query.trim())}`;
}

/**
 * Combobox state for the search modal: holds the input value, debounces it into a
 * suggestion list, and tracks the highlighted option. The article suggestions plus
 * a trailing "search everything" row (index `suggestions.length`) form one
 * keyboard-navigable list. Enter opens the highlighted article, or the results
 * page when nothing is highlighted; Escape and any navigation call `onClose` so
 * the modal dismisses itself.
 */
export function useArticleSearchBox({
    articles,
    initialQuery = '',
    onClose,
}: {
    articles: ArticleSummary[];
    initialQuery?: string;
    onClose: () => void;
}) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [activeIndex, setActiveIndex] = useState(-1);

    const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);
    const trimmedQuery = debouncedQuery.trim();
    const terms = useMemo(() => searchTerms(trimmedQuery), [trimmedQuery]);

    const suggestions = useMemo(() => {
        if (!trimmedQuery) return [];
        return searchArticles(articles, trimmedQuery)
            .slice(0, MAX_SUGGESTIONS)
            .map((result) => result.article);
    }, [articles, trimmedQuery]);

    const searchRowIndex = suggestions.length;
    const hasQuery = trimmedQuery.length > 0;
    // The search row is offered whenever there is a query, even with no matches,
    // so the user can always reach the (possibly empty) results page.
    const optionCount = searchRowIndex + (hasQuery ? 1 : 0);

    // Drop the highlight whenever the suggestion set changes under it.
    useEffect(() => {
        setActiveIndex(-1);
    }, [trimmedQuery]);

    const goToResults = useCallback(() => {
        const next = query.trim();
        if (!next) return;
        onClose();
        router.push(searchResultsHref(next));
    }, [query, router, onClose]);

    const goToArticle = useCallback(
        (slug: string) => {
            onClose();
            router.push(`/articles/${slug}`);
        },
        [router, onClose]
    );

    const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    }, []);

    const clear = useCallback(() => {
        setQuery('');
        setActiveIndex(-1);
    }, []);

    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    setActiveIndex((index) =>
                        optionCount === 0 || index >= optionCount - 1
                            ? 0
                            : index + 1
                    );
                    return;
                case 'ArrowUp':
                    event.preventDefault();
                    setActiveIndex((index) =>
                        index <= 0 ? optionCount - 1 : index - 1
                    );
                    return;
                case 'Enter':
                    event.preventDefault();
                    if (activeIndex >= 0 && activeIndex < suggestions.length) {
                        goToArticle(suggestions[activeIndex].slug);
                    } else {
                        goToResults();
                    }
                    return;
                case 'Escape':
                    // Pre-empt the native type="search" clear so Escape closes
                    // the modal rather than just emptying the field.
                    event.preventDefault();
                    onClose();
                    return;
            }
        },
        [activeIndex, optionCount, suggestions, goToArticle, goToResults, onClose]
    );

    return {
        query,
        terms,
        suggestions,
        searchRowIndex,
        searchRowActive: activeIndex === searchRowIndex,
        activeIndex,
        hasQuery,
        onChange,
        onKeyDown,
        clear,
        goToResults,
        goToArticle,
        highlightOption: setActiveIndex,
    };
}
