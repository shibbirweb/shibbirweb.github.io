import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FacetCard from '@/components/pages/home/AboutMeArea/FacetCard';
import type { Facet } from '@/components/pages/home/AboutMeArea/contents';

const facet: Facet = {
    title: 'Craft',
    text: 'Simple, maintainable software.',
    accent: 'var(--color-blue-500)',
    placementClassName: 'lg:col-start-1',
    line: { x: 16, y: 18 },
    origin: '100% 100%',
};

function getCard() {
    return screen
        .getByRole('heading', { name: 'Craft' })
        .closest('[data-spotlight-surface]') as HTMLElement;
}

describe('FacetCard', () => {
    it('shows the facet title and statement', () => {
        render(<FacetCard facet={facet} />);

        expect(
            screen.getByRole('heading', { level: 3, name: 'Craft' })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Simple, maintainable software.')
        ).toBeInTheDocument();
    });

    it('is a spotlight surface carrying its accent and glow origin', () => {
        render(<FacetCard facet={facet} />);

        const card = getCard();
        expect(card).toHaveAttribute('data-spotlight-surface', 'true');
        expect(card.style.getPropertyValue('--facet-accent')).toBe(
            'var(--color-blue-500)'
        );
        expect(card.style.getPropertyValue('--facet-origin')).toBe('100% 100%');
    });

    it('applies the placement and caller classes', () => {
        render(
            <FacetCard
                facet={facet}
                className="h-full"
            />
        );

        expect(getCard()).toHaveClass('lg:col-start-1', 'h-full');
    });
});
