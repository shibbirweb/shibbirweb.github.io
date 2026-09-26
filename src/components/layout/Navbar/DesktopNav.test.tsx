import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DesktopNav from '@/components/layout/Navbar/DesktopNav';
import type { NavItemData } from '@/components/layout/Navbar/contents';

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

const sectionItems: NavItemData[] = [
    { label: 'About', href: '/#about', sectionId: 'about' },
    { label: 'Skills', href: '/#skills', sectionId: 'skills' },
];
const pageItems: NavItemData[] = [{ label: 'Uses', href: '/uses' }];
const studioItems: NavItemData[] = [
    { label: 'Article Editor', href: '/studio/article-editor' },
];

function renderNav(overrides: Partial<Parameters<typeof DesktopNav>[0]> = {}) {
    return render(
        <DesktopNav
            brandVisible
            sectionItems={sectionItems}
            pageItems={pageItems}
            studioItems={[]}
            isActive={() => false}
            {...overrides}
        />
    );
}

describe('DesktopNav', () => {
    it('renders the logo, sections, and pages in a Primary nav', () => {
        renderNav();

        const nav = screen.getByRole('navigation', { name: 'Primary' });
        const names = within(nav)
            .getAllByRole('link')
            .map((link) => link.getAttribute('aria-label') ?? link.textContent);
        expect(names).toEqual(['Home', 'About', 'Skills', 'Uses']);
    });

    it('marks the active section as the current page', () => {
        renderNav({ isActive: (item) => item.sectionId === 'skills' });

        expect(screen.getByRole('link', { name: 'Skills' })).toHaveAttribute(
            'aria-current',
            'page'
        );
    });

    it('hides the Studio menu when there are no studio items', () => {
        renderNav();

        expect(
            screen.queryByRole('button', { name: 'Studio' })
        ).not.toBeInTheDocument();
    });

    it('opens the Studio menu from the keyboard', async () => {
        const user = userEvent.setup();
        renderNav({ studioItems });

        const trigger = screen.getByRole('button', { name: 'Studio' });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        trigger.focus();
        await user.keyboard('{Enter}');

        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(
            screen.getByRole('menuitem', { name: 'Article Editor' })
        ).toHaveAttribute('href', '/studio/article-editor');
    });

    it('opens the Studio menu on hover and closes it on leave', () => {
        renderNav({ studioItems });

        const trigger = screen.getByRole('button', { name: 'Studio' });
        const group = trigger.closest('li') as HTMLLIElement;

        fireEvent.mouseEnter(group);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');

        fireEvent.mouseLeave(group);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('marks an active studio item as the current page', () => {
        renderNav({
            studioItems,
            isActive: (item) => item.href === '/studio/article-editor',
        });

        expect(
            screen.getByRole('menuitem', {
                name: 'Article Editor',
                hidden: true,
            })
        ).toHaveAttribute('aria-current', 'page');
    });
});
