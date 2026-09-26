import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MobileMenuPanel from '@/components/layout/Navbar/MobileMenuPanel';
import type { NavItemData } from '@/components/layout/Navbar/contents';

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

const sectionItems: NavItemData[] = [
    { label: 'About', href: '/#about', sectionId: 'about' },
];
const pageItems: NavItemData[] = [{ label: 'Now', href: '/now' }];
const studioItems: NavItemData[] = [
    { label: 'Article Editor', href: '/studio/article-editor' },
];

function renderPanel(
    overrides: Partial<Parameters<typeof MobileMenuPanel>[0]> = {}
) {
    return render(
        <MobileMenuPanel
            open
            isHome
            sectionItems={sectionItems}
            pageItems={pageItems}
            studioItems={[]}
            isActive={() => false}
            onNavigate={() => {}}
            {...overrides}
        />
    );
}

describe('MobileMenuPanel', () => {
    it('is a navigation landmark with section and page links', () => {
        renderPanel();

        const nav = screen.getByRole('navigation', { name: 'Primary' });
        expect(within(nav).getByRole('link', { name: 'About' })).toBeVisible();
        expect(within(nav).getByRole('link', { name: 'Now' })).toBeVisible();
    });

    it('shows the logo as a menu item on the home page', () => {
        renderPanel({ isHome: true });

        expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    });

    it('leaves the logo out on inner pages', () => {
        renderPanel({ isHome: false });

        expect(
            screen.queryByRole('link', { name: 'Home' })
        ).not.toBeInTheDocument();
    });

    it('hides the Studio group when there are no studio items', () => {
        renderPanel();

        expect(screen.queryByText('Studio')).not.toBeInTheDocument();
    });

    it('lists the studio items under a Studio label', () => {
        renderPanel({ studioItems });

        expect(screen.getByText('Studio')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Article Editor' })
        ).toHaveAttribute('href', '/studio/article-editor');
    });

    it('marks the active item as the current page', () => {
        renderPanel({ isActive: (item) => item.href === '/now' });

        expect(screen.getByRole('link', { name: 'Now' })).toHaveAttribute(
            'aria-current',
            'page'
        );
        expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute(
            'aria-current'
        );
    });

    it('includes the theme toggle', () => {
        renderPanel();

        expect(
            screen.getByRole('group', { name: 'Theme' })
        ).toBeInTheDocument();
    });

    it('calls onNavigate when a link is chosen', async () => {
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        // jsdom cannot follow a real navigation, so cancel the link's default
        // action once React has handled the click.
        const cancelNavigation = (event: MouseEvent) => event.preventDefault();
        window.addEventListener('click', cancelNavigation);
        renderPanel({ onNavigate });

        await user.click(screen.getByRole('link', { name: 'Now' }));

        window.removeEventListener('click', cancelNavigation);
        expect(onNavigate).toHaveBeenCalledTimes(1);
    });
});
