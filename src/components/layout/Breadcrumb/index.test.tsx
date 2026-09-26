import { render, screen, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import Breadcrumb from '@/components/layout/Breadcrumb';

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}));

const mockedUsePathname = vi.mocked(usePathname);

describe('Breadcrumb', () => {
    it('renders nothing on the home page', () => {
        mockedUsePathname.mockReturnValue('/');

        const { container } = render(<Breadcrumb />);

        expect(container).toBeEmptyDOMElement();
    });

    it('builds the trail from the pathname, starting at ~', () => {
        mockedUsePathname.mockReturnValue('/articles/redis-caching');
        render(<Breadcrumb />);

        const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
        const home = within(nav).getByRole('link', { name: 'Home' });
        expect(home).toHaveTextContent('~');
        expect(home).toHaveAttribute('href', '/');
        expect(
            within(nav).getByRole('link', { name: 'Articles' })
        ).toHaveAttribute('href', '/articles');
    });

    it('renders the last crumb as the current page, not a link', () => {
        mockedUsePathname.mockReturnValue('/articles/redis-caching');
        render(<Breadcrumb />);

        const current = screen.getByText('redis-caching');
        expect(current).toHaveAttribute('aria-current', 'page');
        expect(current.closest('a')).toBeNull();
        expect(screen.getAllByRole('link')).toHaveLength(2);
    });

    it('names each link with a readable, title-cased segment', () => {
        mockedUsePathname.mockReturnValue('/home-lab/rack-notes');
        render(<Breadcrumb />);

        expect(
            screen.getByRole('link', { name: 'Home Lab' })
        ).toHaveTextContent('home-lab');
    });

    it('decodes URL-encoded segments for display', () => {
        mockedUsePathname.mockReturnValue('/tags/c%23');
        render(<Breadcrumb />);

        expect(screen.getByText('c#')).toHaveAttribute('aria-current', 'page');
    });

    it('marks the only segment current on a top-level page', () => {
        mockedUsePathname.mockReturnValue('/uses');
        render(<Breadcrumb />);

        expect(screen.getByText('uses')).toHaveAttribute(
            'aria-current',
            'page'
        );
        expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('keeps the chevron separators out of the accessibility tree', () => {
        mockedUsePathname.mockReturnValue('/articles/redis-caching');
        render(<Breadcrumb />);

        // Three crumbs; the two separators are aria-hidden list items.
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('emits no JSON-LD outside production', () => {
        mockedUsePathname.mockReturnValue('/uses');
        const { container } = render(<Breadcrumb currentName="My setup" />);

        expect(
            container.querySelector('script[type="application/ld+json"]')
        ).toBeNull();
    });
});
