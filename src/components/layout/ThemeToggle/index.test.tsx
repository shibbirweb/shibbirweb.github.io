import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeToggle from '@/components/layout/ThemeToggle';

function prefersDarkScheme(matches: boolean) {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' ? matches : false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    }));
}

describe('ThemeToggle', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders a labelled group of three theme buttons', () => {
        render(<ThemeToggle />);

        const group = screen.getByRole('group', { name: 'Theme' });
        const buttons = within(group).getAllByRole('button');
        expect(
            buttons.map((button) => button.getAttribute('aria-label'))
        ).toEqual(['System theme', 'Light theme', 'Dark theme']);
    });

    it('presses System when nothing is stored', () => {
        render(<ThemeToggle />);

        expect(
            screen.getByRole('button', { name: 'System theme' })
        ).toHaveAttribute('aria-pressed', 'true');
        expect(
            screen.getByRole('button', { name: 'Dark theme' })
        ).toHaveAttribute('aria-pressed', 'false');
    });

    it('presses the stored preference after mount', () => {
        window.localStorage.setItem('theme', 'dark');

        render(<ThemeToggle />);

        expect(
            screen.getByRole('button', { name: 'Dark theme' })
        ).toHaveAttribute('aria-pressed', 'true');
    });

    it('applies and stores an explicit choice', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        await user.click(screen.getByRole('button', { name: 'Dark theme' }));

        const root = document.documentElement;
        expect(root).toHaveAttribute('data-theme', 'dark');
        expect(root.style.colorScheme).toBe('dark');
        expect(window.localStorage.getItem('theme')).toBe('dark');
        expect(
            screen.getByRole('button', { name: 'Dark theme' })
        ).toHaveAttribute('aria-pressed', 'true');
        expect(
            screen.getByRole('button', { name: 'System theme' })
        ).toHaveAttribute('aria-pressed', 'false');
    });

    it('stores system and resolves it from the OS scheme', async () => {
        prefersDarkScheme(true);
        window.localStorage.setItem('theme', 'light');
        const user = userEvent.setup();
        render(<ThemeToggle />);

        await user.click(screen.getByRole('button', { name: 'System theme' }));

        expect(window.localStorage.getItem('theme')).toBe('system');
        expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    });

    it('keeps two mounted toggles in sync', async () => {
        const user = userEvent.setup();
        render(
            <>
                <ThemeToggle />
                <ThemeToggle />
            </>
        );

        const [firstLight, secondLight] = screen.getAllByRole('button', {
            name: 'Light theme',
        });
        await user.click(firstLight);

        expect(secondLight).toHaveAttribute('aria-pressed', 'true');
    });

    it('merges the caller class onto the group', () => {
        render(<ThemeToggle className="px-2" />);

        expect(screen.getByRole('group', { name: 'Theme' })).toHaveClass(
            'flex',
            'px-2'
        );
    });
});
