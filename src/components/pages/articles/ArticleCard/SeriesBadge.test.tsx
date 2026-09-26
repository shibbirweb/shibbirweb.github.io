import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeriesBadge from '@/components/pages/articles/ArticleCard/SeriesBadge';

describe('SeriesBadge', () => {
    it('reads "Part N of M" when the published total is known', () => {
        render(
            <SeriesBadge
                order={2}
                total={3}
                name="Building an LLM Knowledge System"
            />
        );

        expect(screen.getByText('Part 2 of 3')).toBeInTheDocument();
        expect(
            screen.getByText('Building an LLM Knowledge System')
        ).toBeInTheDocument();
    });

    it('falls back to "Part N" when the total is unknown', () => {
        render(
            <SeriesBadge
                order={1}
                name="Home lab"
            />
        );

        expect(screen.getByText('Part 1')).toBeInTheDocument();
        expect(screen.queryByText(/of/)).not.toBeInTheDocument();
    });

    it('falls back to "Part N" when only one part is published', () => {
        render(
            <SeriesBadge
                order={1}
                total={1}
                name="Home lab"
            />
        );

        expect(screen.getByText('Part 1')).toBeInTheDocument();
    });

    it('hides the series icon from assistive tech', () => {
        const { container } = render(
            <SeriesBadge
                order={1}
                total={2}
                name="Home lab"
            />
        );

        const icon = container.querySelector('svg');
        expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
});
