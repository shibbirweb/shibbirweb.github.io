import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TopicFilter from '@/components/pages/articles/ArticlesBrowse/TopicFilter';
import { articleNoun } from '@/components/pages/articles/ArticlesBrowse/countNoun';

const topics = [
    { tag: 'Laravel', count: 3 },
    { tag: 'C# & .NET', count: 1 },
];

function renderFilter(active: string | null) {
    return render(
        <TopicFilter
            topics={topics}
            totalCount={5}
            active={active}
            basePath="/articles"
            countNoun={articleNoun}
            label="Filter articles by tag"
        />
    );
}

describe('TopicFilter', () => {
    it('starts with All, then every topic in the given order', () => {
        renderFilter(null);

        const links = within(
            screen.getByRole('navigation', { name: 'Filter articles by tag' })
        ).getAllByRole('link');
        expect(links.map((link) => link.getAttribute('href'))).toEqual([
            '/articles',
            '/articles?tag=Laravel',
            '/articles?tag=C%23%20%26%20.NET',
        ]);
        expect(links[0]).toHaveAttribute('aria-current', 'page');
        expect(links[0]).toHaveAccessibleName('All (5 articles)');
    });

    it('links the selected topic back to the unfiltered page', () => {
        renderFilter('Laravel');

        const selected = screen.getByRole('link', { current: 'page' });
        expect(selected).toHaveAccessibleName(/^Laravel/);
        expect(selected).toHaveAttribute('href', '/articles');
        expect(
            screen.getByRole('link', { name: 'All (5 articles)' })
        ).not.toHaveAttribute('aria-current');
    });
});
