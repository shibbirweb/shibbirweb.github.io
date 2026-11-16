import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ActiveTopicChip from '@/components/pages/articles/ArticlesBrowse/ActiveTopicChip';

describe('ActiveTopicChip', () => {
    it('names the applied topic and links to the unfiltered page', () => {
        render(
            <ActiveTopicChip
                tag="Laravel"
                clearHref="/articles/series"
            />
        );

        const chip = screen.getByRole('link', {
            name: 'Topic: Laravel, clear filter',
        });
        expect(chip).toHaveAttribute('href', '/articles/series');
        expect(chip.querySelector('svg')).toHaveAttribute('aria-hidden');
    });
});
