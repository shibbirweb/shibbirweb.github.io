import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticlesBrowse from '@/components/pages/articles/ArticlesBrowse';
import type { ArticleSummary } from '@/lib/posts';

function buildArticle(
    slug: string,
    extra: Partial<ArticleSummary> = {}
): ArticleSummary {
    return {
        slug,
        title: slug,
        description: '',
        date: '2026-01-10',
        tags: ['Laravel'],
        cover: `/images/articles/${slug}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
        ...extra,
    };
}

describe('ArticlesBrowse', () => {
    it('shows the most recently updated series', () => {
        render(
            <ArticlesBrowse
                articles={[
                    buildArticle('old', {
                        series: { name: 'Old series', order: 1 },
                        date: '2025-01-01',
                    }),
                    buildArticle('new', {
                        series: { name: 'New series', order: 1 },
                        date: '2026-01-01',
                    }),
                ]}
                activeTag={null}
            />
        );

        expect(
            screen.getByRole('link', { name: /New series/ })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('link', { name: /Old series/ })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'All series (2)' })
        ).toBeInTheDocument();
    });

    it('leaves the series out when there are none, keeping Filters', () => {
        render(
            <ArticlesBrowse
                articles={[buildArticle('solo')]}
                activeTag={null}
            />
        );

        expect(
            screen.queryByRole('heading', { name: 'Latest series' })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Filters' })
        ).toBeInTheDocument();
    });

    it('counts topics in articles and filters /articles', () => {
        render(
            <ArticlesBrowse
                articles={[buildArticle('one'), buildArticle('two')]}
                activeTag="Laravel"
            />
        );

        expect(
            screen.getByRole('link', { name: 'All (2 articles)' })
        ).toHaveAttribute('href', '/articles');
    });
});
