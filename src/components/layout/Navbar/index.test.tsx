import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from '@/components/layout/Navbar';
import { isDevelopment } from '@/config/env';

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}));

const mockedUsePathname = vi.mocked(usePathname);

function getPrimaryNavs() {
    return screen.getAllByRole('navigation', { name: 'Primary' });
}

describe('Navbar', () => {
    beforeEach(() => {
        mockedUsePathname.mockReturnValue('/uses');
    });

    it('renders a desktop and a mobile Primary nav plus the theme menu', () => {
        render(<Navbar />);

        expect(getPrimaryNavs()).toHaveLength(2);
        expect(
            screen.getByRole('button', { name: 'Theme' })
        ).toBeInTheDocument();
    });

    it('hides the Articles item by default', () => {
        render(<Navbar />);

        expect(
            screen.queryByRole('link', { name: 'Articles' })
        ).not.toBeInTheDocument();
    });

    it('shows the Articles item when there are articles', () => {
        render(<Navbar hasArticles />);

        // One in the desktop bar, one in the mobile panel.
        expect(screen.getAllByRole('link', { name: 'Articles' })).toHaveLength(
            2
        );
    });

    it('always links the resume page', () => {
        render(<Navbar />);

        for (const link of screen.getAllByRole('link', { name: 'Resume' })) {
            expect(link).toHaveAttribute('href', '/resume');
        }
    });

    it('marks the page matching the pathname as current', () => {
        render(<Navbar />);

        for (const link of screen.getAllByRole('link', { name: 'Uses' })) {
            expect(link).toHaveAttribute('aria-current', 'page');
        }
        for (const link of screen.getAllByRole('link', { name: 'Now' })) {
            expect(link).not.toHaveAttribute('aria-current');
        }
    });

    it('never marks a section item current off the home page', () => {
        render(<Navbar />);

        for (const link of screen.getAllByRole('link', { name: 'About' })) {
            expect(link).not.toHaveAttribute('aria-current');
        }
    });

    it('shows the Studio tools outside production', () => {
        // NODE_ENV is "test" under vitest, which counts as development.
        expect(isDevelopment).toBe(true);
        render(<Navbar />);

        expect(
            screen.getByRole('button', { name: 'Studio' })
        ).toBeInTheDocument();
    });

    it('shows the home logo inside the mobile panel on the home page', () => {
        mockedUsePathname.mockReturnValue('/');
        render(<Navbar />);

        // Desktop wordmark plus the static logo item in the mobile panel.
        expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(2);
    });

    it('uses the travelling wordmark on inner pages', () => {
        render(<Navbar />);

        // Desktop wordmark plus the shared mobile wordmark (not in the panel).
        expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(2);
    });
});
