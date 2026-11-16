import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ArticlesResults from '@/components/pages/articles/ArticlesResults';
import {
    ARTICLES_VIEW_ATTRIBUTE,
    ARTICLES_VIEW_STORAGE_KEY,
} from '@/components/pages/articles/ArticlesViewToggle/articlesView';
import type { ArticleSummary } from '@/lib/posts';

const articles: ArticleSummary[] = [1, 2].map((index) => ({
    slug: `article-${index}`,
    title: `Article ${index}`,
    description: `Description ${index}.`,
    date: '2026-01-10',
    tags: ['AI'],
    cover: `/images/articles/article-${index}.svg`,
    coverColors: ['#000000', '#ffffff'],
    readingMinutes: 3,
}));

afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(ARTICLES_VIEW_ATTRIBUTE);
});

// Grid cards carry the cover image; list rows replace it with a date tile.
function coverImages() {
    return document.querySelectorAll('li[data-spotlight-surface] img');
}

describe('ArticlesResults', () => {
    it('shows the row list by default', () => {
        render(
            <ArticlesResults
                articles={articles}
                seriesTotals={{}}
            />
        );

        expect(coverImages()).toHaveLength(0);
        expect(screen.getAllByRole('list')[0]).toHaveClass('flex-col');
        expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    });

    it('shows the card grid when the grid is saved', () => {
        window.localStorage.setItem(ARTICLES_VIEW_STORAGE_KEY, 'grid');

        render(
            <ArticlesResults
                articles={articles}
                seriesTotals={{}}
            />
        );

        expect(coverImages()).toHaveLength(2);
        expect(screen.getAllByRole('list')[0]).toHaveClass('grid');
    });
});
