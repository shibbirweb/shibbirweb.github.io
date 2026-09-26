import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchTrigger from '@/components/pages/articles/ArticleSearch/SearchTrigger';

afterEach(() => {
    vi.restoreAllMocks();
});

function shortcutKeys(): string[] {
    return Array.from(document.querySelectorAll('kbd')).map(
        (key) => key.textContent ?? ''
    );
}

describe('SearchTrigger', () => {
    it('shows the Cmd shortcut on macOS', () => {
        vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');

        render(<SearchTrigger onClick={() => {}} />);

        expect(shortcutKeys()).toEqual(['⌘', 'K']);
    });

    it('shows the Ctrl shortcut elsewhere', () => {
        vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');

        render(<SearchTrigger onClick={() => {}} />);

        expect(shortcutKeys()).toEqual(['Ctrl', 'K']);
    });

    it('is a labelled button advertising both shortcuts', () => {
        render(<SearchTrigger onClick={() => {}} />);

        const button = screen.getByRole('button', { name: 'Search articles' });
        expect(button).toHaveAttribute('aria-keyshortcuts', 'Control+K Meta+K');
    });

    it('calls onClick when pressed', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<SearchTrigger onClick={onClick} />);

        await user.click(
            screen.getByRole('button', { name: 'Search articles' })
        );

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
