import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChangeEvent, KeyboardEvent } from 'react';
import {
    searchResultsHref,
    useArticleSearchBox,
} from '@/components/pages/articles/ArticleSearch/hooks/useArticleSearchBox';
import type { ArticleSummary } from '@/lib/posts';

const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
    useRouter: () => router,
}));

const DEBOUNCE_MS = 160;

function buildArticle(
    index: number,
    title: string,
    tags: string[] = []
): ArticleSummary {
    return {
        slug: `article-${index}`,
        title,
        description: '',
        // Distinct dates so equal-score ties sort deterministically (newest first).
        date: `2026-01-${String(10 + index).padStart(2, '0')}`,
        tags,
        cover: `/images/articles/article-${index}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
    };
}

const dockerArticles = Array.from({ length: 8 }, (_, index) =>
    buildArticle(index + 1, `Docker note ${index + 1}`)
);
const mixedArticles = [
    buildArticle(1, 'Docker basics', ['Docker']),
    buildArticle(2, 'WireGuard tunnels', ['VPN']),
];

function changeEvent(value: string) {
    return { target: { value } } as ChangeEvent<HTMLInputElement>;
}

function keyEvent(key: string) {
    return {
        key,
        preventDefault: vi.fn(),
    } as unknown as KeyboardEvent<HTMLInputElement> & {
        preventDefault: ReturnType<typeof vi.fn>;
    };
}

function renderSearchBox(
    articles: ArticleSummary[] = mixedArticles,
    initialQuery = ''
) {
    const onClose = vi.fn();
    const hook = renderHook(() =>
        useArticleSearchBox({ articles, initialQuery, onClose })
    );
    return { ...hook, onClose };
}

function typeQuery(
    result: { current: ReturnType<typeof useArticleSearchBox> },
    value: string
) {
    act(() => {
        result.current.onChange(changeEvent(value));
    });
    act(() => {
        vi.advanceTimersByTime(DEBOUNCE_MS);
    });
}

function press(
    result: { current: ReturnType<typeof useArticleSearchBox> },
    key: string
) {
    const event = keyEvent(key);
    act(() => {
        result.current.onKeyDown(event);
    });
    return event;
}

beforeEach(() => {
    vi.useFakeTimers();
    router.push.mockClear();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('searchResultsHref', () => {
    it('trims and URL-encodes the query', () => {
        expect(searchResultsHref('  self hosting & vpn ')).toBe(
            '/articles/search?q=self%20hosting%20%26%20vpn'
        );
    });
});

describe('useArticleSearchBox', () => {
    it('starts with no query, no suggestions, and nothing highlighted', () => {
        const { result } = renderSearchBox();

        expect(result.current.query).toBe('');
        expect(result.current.hasQuery).toBe(false);
        expect(result.current.suggestions).toEqual([]);
        expect(result.current.activeIndex).toBe(-1);
    });

    it('updates the input value at once but debounces suggestions by 160ms', () => {
        const { result } = renderSearchBox();

        act(() => {
            result.current.onChange(changeEvent('docker'));
        });
        expect(result.current.query).toBe('docker');
        expect(result.current.suggestions).toEqual([]);

        act(() => {
            vi.advanceTimersByTime(DEBOUNCE_MS - 1);
        });
        expect(result.current.hasQuery).toBe(false);

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current.hasQuery).toBe(true);
        expect(
            result.current.suggestions.map((article) => article.slug)
        ).toEqual(['article-1']);
        expect(result.current.terms).toEqual(['docker']);
    });

    it('caps suggestions at six but reports the full match count', () => {
        const { result } = renderSearchBox(dockerArticles);

        typeQuery(result, 'docker');

        expect(result.current.suggestions).toHaveLength(6);
        expect(result.current.resultCount).toBe(8);
        expect(result.current.searchRowIndex).toBe(6);
    });

    it('pre-fills from initialQuery', () => {
        const { result } = renderSearchBox(mixedArticles, 'wireguard');

        expect(result.current.query).toBe('wireguard');
        expect(
            result.current.suggestions.map((article) => article.slug)
        ).toEqual(['article-2']);
    });

    it('moves the highlight down and wraps from the search row to the top', () => {
        const { result } = renderSearchBox();
        typeQuery(result, 'docker');
        // One suggestion plus the trailing "Search for" row.

        const event = press(result, 'ArrowDown');
        expect(event.preventDefault).toHaveBeenCalled();
        expect(result.current.activeIndex).toBe(0);

        press(result, 'ArrowDown');
        expect(result.current.activeIndex).toBe(1);
        expect(result.current.searchRowActive).toBe(true);

        press(result, 'ArrowDown');
        expect(result.current.activeIndex).toBe(0);
    });

    it('moves the highlight up and wraps from the top to the search row', () => {
        const { result } = renderSearchBox();
        typeQuery(result, 'docker');

        press(result, 'ArrowUp');
        expect(result.current.activeIndex).toBe(1);
        expect(result.current.searchRowActive).toBe(true);

        press(result, 'ArrowUp');
        expect(result.current.activeIndex).toBe(0);

        press(result, 'ArrowUp');
        expect(result.current.activeIndex).toBe(1);
    });

    it('offers only the search row when nothing matches', () => {
        const { result } = renderSearchBox();
        typeQuery(result, 'kubernetes');

        expect(result.current.suggestions).toEqual([]);
        press(result, 'ArrowDown');
        expect(result.current.searchRowActive).toBe(true);
        press(result, 'ArrowDown');
        expect(result.current.activeIndex).toBe(0);
    });

    it('opens the highlighted article on Enter and closes the modal', () => {
        const { result, onClose } = renderSearchBox();
        typeQuery(result, 'docker');
        press(result, 'ArrowDown');

        const event = press(result, 'Enter');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(router.push).toHaveBeenCalledWith('/articles/article-1');
    });

    it('opens the results page on Enter when nothing is highlighted', () => {
        const { result, onClose } = renderSearchBox();
        typeQuery(result, '  docker ');

        press(result, 'Enter');

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(router.push).toHaveBeenCalledWith('/articles/search?q=docker');
    });

    it('opens the results page on Enter over the "Search for" row', () => {
        const { result } = renderSearchBox();
        typeQuery(result, 'docker');
        press(result, 'ArrowUp');

        press(result, 'Enter');

        expect(router.push).toHaveBeenCalledWith('/articles/search?q=docker');
    });

    it('does nothing on Enter with a blank query', () => {
        const { result, onClose } = renderSearchBox();
        typeQuery(result, '   ');

        press(result, 'Enter');

        expect(onClose).not.toHaveBeenCalled();
        expect(router.push).not.toHaveBeenCalled();
    });

    it('closes on Escape and pre-empts the native search clear', () => {
        const { result, onClose } = renderSearchBox();

        const event = press(result, 'Escape');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('leaves other keys alone', () => {
        const { result } = renderSearchBox();

        const event = press(result, 'a');

        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('drops the highlight when the debounced query changes', () => {
        const { result } = renderSearchBox();
        typeQuery(result, 'docker');
        press(result, 'ArrowDown');
        expect(result.current.activeIndex).toBe(0);

        typeQuery(result, 'docker basics');

        expect(result.current.activeIndex).toBe(-1);
    });

    it('clear empties the query and the highlight', () => {
        const { result } = renderSearchBox();
        typeQuery(result, 'docker');
        press(result, 'ArrowDown');

        act(() => {
            result.current.clear();
        });

        expect(result.current.query).toBe('');
        expect(result.current.activeIndex).toBe(-1);
    });

    it('goToArticle closes and navigates to the article', () => {
        const { result, onClose } = renderSearchBox();

        act(() => {
            result.current.goToArticle('article-2');
        });

        expect(onClose).toHaveBeenCalled();
        expect(router.push).toHaveBeenCalledWith('/articles/article-2');
    });
});
