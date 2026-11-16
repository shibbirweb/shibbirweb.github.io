import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import QueryArticleSearch from '@/components/pages/articles/SearchResults/QueryArticleSearch';

vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams('q=%20docker%20'),
    useRouter: () => ({ push: vi.fn() }),
}));

describe('QueryArticleSearch', () => {
    it('opens the search pre-filled with the trimmed ?q=', async () => {
        render(<QueryArticleSearch articles={[]} />);

        await userEvent
            .setup()
            .click(screen.getByRole('button', { name: 'Search articles' }));

        expect(screen.getByRole('combobox')).toHaveValue('docker');
    });
});
