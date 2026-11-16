import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ArticlesList from '@/components/pages/articles/ArticlesList';
import {
    ARTICLES_VIEW_ATTRIBUTE,
    ARTICLES_VIEW_STORAGE_KEY,
} from '@/components/pages/articles/ArticlesViewToggle/articlesView';
import { ARTICLES_PER_PAGE, type ArticleSummary } from '@/lib/posts';

const navigation = vi.hoisted(() => ({
    searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
    useSearchParams: () => navigation.searchParams,
}));

function buildArticle(index: number, tags: string[] = []): ArticleSummary {
    return {
        slug: `article-${index}`,
        title: `Article ${index}`,
        description: `Description ${index}.`,
        date: '2026-01-10',
        tags,
        cover: `/images/articles/article-${index}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
    };
}

function buildArticles(count: number): ArticleSummary[] {
    return Array.from({ length: count }, (_, index) => buildArticle(index + 1));
}

function renderList(articles: ArticleSummary[]) {
    return render(
        <ArticlesList
            articles={articles}
            perPage={ARTICLES_PER_PAGE}
        />
    );
}

function cardTitles(): string[] {
    return screen
        .queryAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent ?? '');
}

afterEach(() => {
    navigation.searchParams = new URLSearchParams();
    window.localStorage.clear();
    document.documentElement.removeAttribute(ARTICLES_VIEW_ATTRIBUTE);
});

describe('ArticlesList', () => {
    it('shows the first ARTICLES_PER_PAGE articles on page one', () => {
        renderList(buildArticles(ARTICLES_PER_PAGE + 2));

        const titles = cardTitles();
        expect(titles).toHaveLength(ARTICLES_PER_PAGE);
        expect(titles[0]).toBe('Article 1');
        expect(titles[ARTICLES_PER_PAGE - 1]).toBe(
            `Article ${ARTICLES_PER_PAGE}`
        );
    });

    it('slices the requested page from ?page=', () => {
        navigation.searchParams = new URLSearchParams('page=2');

        renderList(buildArticles(ARTICLES_PER_PAGE + 2));

        expect(cardTitles()).toEqual([
            `Article ${ARTICLES_PER_PAGE + 1}`,
            `Article ${ARTICLES_PER_PAGE + 2}`,
        ]);
        expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    it.each(['0', '-1', '1.5', 'abc', '99'])(
        'falls back to page one for an invalid ?page=%s',
        (page) => {
            navigation.searchParams = new URLSearchParams({ page });

            renderList(buildArticles(ARTICLES_PER_PAGE + 2));

            expect(cardTitles()[0]).toBe('Article 1');
            expect(screen.getByRole('link', { name: '1' })).toHaveAttribute(
                'aria-current',
                'page'
            );
        }
    );

    it('hides pagination when everything fits on one page', () => {
        renderList(buildArticles(2));

        expect(
            screen.queryByRole('navigation', { name: 'Article pages' })
        ).not.toBeInTheDocument();
    });

    it('filters to articles carrying the ?tag= tag', () => {
        navigation.searchParams = new URLSearchParams('tag=Docker');

        renderList([
            buildArticle(1, ['Docker']),
            buildArticle(2, ['AI']),
            buildArticle(3, ['Docker', 'AI']),
        ]);

        expect(cardTitles()).toEqual(['Article 1', 'Article 3']);
        const filter = screen.getByRole('navigation', {
            name: 'Filter articles by tag',
        });
        expect(filter).toBeInTheDocument();
    });

    it('opens the topics with the active tag marked', () => {
        navigation.searchParams = new URLSearchParams('tag=AI');

        renderList([buildArticle(1, ['AI']), buildArticle(2, ['Docker'])]);

        expect(screen.getByRole('button', { name: /Filters/ })).toHaveAttribute(
            'aria-expanded',
            'true'
        );
        expect(
            screen.getByRole('link', { name: /^AI/, current: 'page' })
        ).toHaveAttribute('href', '/articles');
    });

    it('shows an empty state when no article has the tag', () => {
        navigation.searchParams = new URLSearchParams('tag=Rust');

        renderList([buildArticle(1, ['AI'])]);

        expect(
            screen.getByText('No articles found for this tag.')
        ).toBeInTheDocument();
        expect(cardTitles()).toEqual([]);
    });

    it('keeps the active tag in pagination links', () => {
        navigation.searchParams = new URLSearchParams('tag=AI');
        const tagged = Array.from(
            { length: ARTICLES_PER_PAGE + 1 },
            (_, index) => buildArticle(index + 1, ['AI'])
        );

        renderList(tagged);

        expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
            'href',
            '/articles?tag=AI&page=2'
        );
    });

    it('counts series parts from the full set, not the filtered slice', () => {
        navigation.searchParams = new URLSearchParams('tag=AI');
        const partOne = {
            ...buildArticle(1, ['AI']),
            series: { name: 'Home lab', order: 1 },
        };
        const partTwo = {
            ...buildArticle(2, ['Docker']),
            series: { name: 'Home lab', order: 2 },
        };

        renderList([partOne, partTwo]);

        expect(screen.getByText('Part 1 of 2')).toBeInTheDocument();
    });

    it('counts the filtered articles next to the layout toggle', () => {
        navigation.searchParams = new URLSearchParams('tag=AI');

        renderList([
            buildArticle(1, ['AI']),
            buildArticle(2, ['AI']),
            buildArticle(3),
        ]);

        const toggle = screen.getByRole('group', { name: 'Layout' });
        expect(toggle.parentElement?.parentElement).toHaveTextContent(
            '2 articles'
        );
    });

    it('shows the rows by default and the grid when the grid is saved', () => {
        const { unmount } = renderList(buildArticles(2));
        expect(cardTitles()).toEqual(['Article 1', 'Article 2']);
        expect(
            document.querySelectorAll('li[data-spotlight-surface] img')
        ).toHaveLength(0);
        unmount();

        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'grid');
        renderList(buildArticles(2));

        expect(
            document.querySelectorAll('li[data-spotlight-surface] img')
        ).toHaveLength(2);
    });

    it('leaves the toolbar out of the empty state', () => {
        navigation.searchParams = new URLSearchParams('tag=Nope');

        renderList(buildArticles(2));

        expect(
            screen.queryByRole('group', { name: 'Layout' })
        ).not.toBeInTheDocument();
    });
});
