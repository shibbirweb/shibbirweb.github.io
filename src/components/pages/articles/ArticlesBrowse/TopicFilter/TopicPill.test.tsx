import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TopicPill from '@/components/pages/articles/ArticlesBrowse/TopicFilter/TopicPill';
import {
    articleNoun,
    seriesNoun,
} from '@/components/pages/articles/ArticlesBrowse/countNoun';

describe('TopicPill', () => {
    it('links to the topic and reads its count with the noun', () => {
        render(
            <TopicPill
                label="Laravel"
                count={3}
                href="/articles?tag=Laravel"
                isActive={false}
                countNoun={articleNoun}
            />
        );

        const pill = screen.getByRole('link', {
            name: 'Laravel (3 articles)',
        });
        expect(pill).toHaveAttribute('href', '/articles?tag=Laravel');
        expect(pill).not.toHaveAttribute('aria-current');
    });

    it('marks the selected topic and offers to clear it', () => {
        render(
            <TopicPill
                label="Laravel"
                count={1}
                href="/articles/series"
                isActive
                countNoun={seriesNoun}
                clearsFilter
            />
        );

        const pill = screen.getByRole('link', {
            name: 'Laravel (1 series), clear filter',
        });
        expect(pill).toHaveAttribute('aria-current', 'page');
        expect(pill).toHaveClass('bg-foreground');
    });
});
