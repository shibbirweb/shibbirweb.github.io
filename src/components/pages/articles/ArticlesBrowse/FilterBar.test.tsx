import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import FilterBar from '@/components/pages/articles/ArticlesBrowse/FilterBar';
import { seriesNoun } from '@/components/pages/articles/ArticlesBrowse/countNoun';

const topics = [
    { tag: 'Laravel', count: 2 },
    { tag: 'Git', count: 1 },
];

function renderBar(activeTag: string | null = null) {
    return render(
        <FilterBar
            leading={<p>2 series</p>}
            trailing={<button type="button">Layout</button>}
            topics={topics}
            totalCount={2}
            activeTag={activeTag}
            basePath="/articles/series"
            countNoun={seriesNoun}
            label="Filter series by tag"
            className="mt-8"
        />
    );
}

function topicNav() {
    return screen.queryByRole('navigation', { name: 'Filter series by tag' });
}

describe('FilterBar', () => {
    it('shows the leading and trailing content beside Filters', () => {
        const { container } = renderBar();

        expect(screen.getByText('2 series')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Layout' })
        ).toBeInTheDocument();
        expect(container.firstChild).toHaveClass('mt-8');
    });

    it('keeps the topics folded until Filters is pressed', async () => {
        const user = userEvent.setup();
        renderBar();

        expect(topicNav()).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Filters' }));

        expect(topicNav()).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Filters' })).toHaveAttribute(
            'aria-expanded',
            'true'
        );

        await user.click(screen.getByRole('button', { name: 'Filters' }));

        expect(topicNav()).not.toBeInTheDocument();
    });

    it('opens on its own when a topic is applied', () => {
        renderBar('Laravel');

        expect(topicNav()).toBeInTheDocument();
        expect(
            screen.queryByRole('link', { name: /clear filter/ })
        ).toHaveAttribute('aria-current', 'page');
    });

    it('names the applied topic beside Filters once the panel is closed', async () => {
        const user = userEvent.setup();
        renderBar('Laravel');

        await user.click(screen.getByRole('button', { name: /Filters/ }));

        expect(
            screen.getByRole('link', { name: 'Topic: Laravel, clear filter' })
        ).toHaveAttribute('href', '/articles/series');
    });

    it('leaves Filters out when there are no topics', () => {
        render(
            <FilterBar
                topics={[]}
                totalCount={0}
                activeTag={null}
                basePath="/articles"
                countNoun={seriesNoun}
                label="Filter articles by tag"
            />
        );

        expect(
            screen.queryByRole('button', { name: /Filters/ })
        ).not.toBeInTheDocument();
    });
});
