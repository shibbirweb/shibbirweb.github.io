import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ThemeMenu from '@/components/layout/ThemeToggle/ThemeMenu';

vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

function getTrigger() {
    return screen.getByRole('button', { name: 'Theme' });
}

describe('ThemeMenu', () => {
    it('starts closed with a menu trigger', () => {
        render(<ThemeMenu />);

        expect(getTrigger()).toHaveAttribute('aria-haspopup', 'menu');
        expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens the menu on click', async () => {
        const user = userEvent.setup();
        render(<ThemeMenu />);

        await user.click(getTrigger());

        expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('menu', { name: 'Theme' })).toBeInTheDocument();
    });

    it('lists the three preferences as radio items with system checked', () => {
        render(<ThemeMenu />);

        const items = screen.getAllByRole('menuitemradio');
        expect(items.map((item) => item.textContent)).toEqual([
            'System',
            'Light',
            'Dark',
        ]);
        expect(
            screen.getByRole('menuitemradio', { name: 'System' })
        ).toHaveAttribute('aria-checked', 'true');
    });

    it('applies the chosen preference and closes', async () => {
        const user = userEvent.setup();
        render(<ThemeMenu />);

        await user.click(getTrigger());
        await user.click(screen.getByRole('menuitemradio', { name: 'Light' }));

        expect(document.documentElement).toHaveAttribute('data-theme', 'light');
        expect(window.localStorage.getItem('theme')).toBe('light');
        expect(
            screen.getByRole('menuitemradio', { name: 'Light' })
        ).toHaveAttribute('aria-checked', 'true');
        expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes on Escape', async () => {
        const user = userEvent.setup();
        render(<ThemeMenu />);

        await user.click(getTrigger());
        await user.keyboard('{Escape}');

        expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes on a press outside the menu', async () => {
        const user = userEvent.setup();
        render(
            <>
                <ThemeMenu />
                <p>Elsewhere</p>
            </>
        );

        await user.click(getTrigger());
        fireEvent.pointerDown(screen.getByText('Elsewhere'));

        expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('stays open on a press inside the menu', async () => {
        const user = userEvent.setup();
        render(<ThemeMenu />);

        await user.click(getTrigger());
        fireEvent.pointerDown(screen.getByRole('menu'));

        expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggles closed on a second trigger click', async () => {
        const user = userEvent.setup();
        render(<ThemeMenu />);

        await user.click(getTrigger());
        await user.click(getTrigger());

        expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });
});
