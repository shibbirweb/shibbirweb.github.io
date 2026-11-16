import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PageTopBar from '@/components/pages/common/PageTopBar';

vi.mock('next/navigation', () => ({
    usePathname: () => '/uses',
}));

describe('PageTopBar', () => {
    it('shows the breadcrumb and keeps the h1 for screen readers only', () => {
        render(<PageTopBar title="Uses" />);

        expect(
            screen.getByRole('navigation', { name: 'Breadcrumb' })
        ).not.toHaveClass('mb-6');
        expect(
            screen.getByRole('heading', { level: 1, name: 'Uses' })
        ).toHaveClass('sr-only');
    });

    it('adds the intro line for screen readers only, when given', () => {
        const { rerender, container } = render(<PageTopBar title="Uses" />);
        expect(container.querySelector('p')).toBeNull();

        rerender(
            <PageTopBar
                title="Uses"
                description="My setup."
            />
        );
        expect(screen.getByText('My setup.')).toHaveClass('sr-only');
    });

    it('puts the action on the breadcrumb row', () => {
        render(
            <PageTopBar
                title="Articles"
                action={<button type="button">Search</button>}
            />
        );

        const row = screen.getByRole('navigation', {
            name: 'Breadcrumb',
        }).parentElement;
        expect(row).toContainElement(
            screen.getByRole('button', { name: 'Search' })
        );
    });
});
