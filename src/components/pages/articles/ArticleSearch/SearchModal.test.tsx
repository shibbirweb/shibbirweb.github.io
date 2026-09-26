import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchModal from '@/components/pages/articles/ArticleSearch/SearchModal';
import type { ArticleSummary } from '@/lib/posts';

const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
    useRouter: () => router,
}));

function buildArticle(
    slug: string,
    title: string,
    tags: string[],
    date: string
): ArticleSummary {
    return {
        slug,
        title,
        description: '',
        date,
        tags,
        cover: `/images/articles/${slug}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 3,
    };
}

const articles = [
    buildArticle('docker-basics', 'Docker basics', ['Docker'], '2026-02-01'),
    buildArticle('docker-compose', 'Compose files', ['Docker'], '2026-01-01'),
    buildArticle('wireguard', 'WireGuard tunnels', ['VPN'], '2026-03-01'),
];

function renderModal(initialQuery = '') {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
        <SearchModal
            articles={articles}
            initialQuery={initialQuery}
            onClose={onClose}
        />
    );
    return { onClose, user };
}

beforeEach(() => {
    router.push.mockClear();
});

describe('SearchModal', () => {
    it('is a labelled modal dialog with the combobox focused', () => {
        renderModal();

        const dialog = screen.getByRole('dialog', { name: 'Search articles' });
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('prompts before anything is typed and keeps the combobox collapsed', () => {
        renderModal();

        expect(
            screen.getByText(
                'Start typing to find an article by its title or a tag.'
            )
        ).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveAttribute(
            'aria-expanded',
            'false'
        );
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('lists matching articles plus a "Search for" row once typing settles', async () => {
        const { user } = renderModal();

        await user.type(screen.getByRole('combobox'), 'docker');

        const listbox = await screen.findByRole('listbox', {
            name: 'Article suggestions',
        });
        const options = within(listbox).getAllByRole('option');
        expect(options).toHaveLength(3);
        expect(options[0]).toHaveTextContent('Docker basics');
        expect(options[1]).toHaveTextContent('Compose files');
        expect(options[2]).toHaveTextContent('Search for “docker”');
        expect(screen.getByRole('combobox')).toHaveAttribute(
            'aria-expanded',
            'true'
        );
        expect(screen.getByRole('combobox')).toHaveAttribute(
            'aria-controls',
            listbox.id
        );
        expect(screen.getByRole('status')).toHaveTextContent('2 results');
    });

    it('highlights the matched terms in suggestions', async () => {
        const { user } = renderModal();

        await user.type(screen.getByRole('combobox'), 'wire');

        const listbox = await screen.findByRole('listbox');
        const marks = listbox.querySelectorAll('mark');
        expect(Array.from(marks).map((mark) => mark.textContent)).toEqual([
            'Wire',
        ]);
    });

    it('uses the singular for one result', async () => {
        const { user } = renderModal();

        await user.type(screen.getByRole('combobox'), 'wireguard');

        expect(await screen.findByRole('status')).toHaveTextContent('1 result');
    });

    it('shows a no-match hint but still offers the full search row', async () => {
        const { user } = renderModal();

        await user.type(screen.getByRole('combobox'), 'kubernetes');

        const listbox = await screen.findByRole('listbox');
        expect(
            within(listbox).getByText(
                'No titles or tags match. Try the full search below.'
            )
        ).toBeInTheDocument();
        expect(within(listbox).getAllByRole('option')).toHaveLength(1);
    });

    it('tracks the arrow-key highlight with aria-activedescendant', async () => {
        const { user } = renderModal();
        const input = screen.getByRole('combobox');
        await user.type(input, 'docker');
        const listbox = await screen.findByRole('listbox');

        await user.keyboard('{ArrowDown}');

        const [first] = within(listbox).getAllByRole('option');
        expect(input).toHaveAttribute('aria-activedescendant', first.id);
        expect(first).toHaveAttribute('aria-selected', 'true');
    });

    it('opens the highlighted article on Enter', async () => {
        const { user, onClose } = renderModal();
        await user.type(screen.getByRole('combobox'), 'docker');
        await screen.findByRole('listbox');

        await user.keyboard('{ArrowDown}{Enter}');

        expect(onClose).toHaveBeenCalled();
        expect(router.push).toHaveBeenCalledWith('/articles/docker-basics');
    });

    it('opens the results page when the "Search for" row is clicked', async () => {
        const { user } = renderModal();
        await user.type(screen.getByRole('combobox'), 'docker');
        await screen.findByRole('listbox');

        await user.click(screen.getByRole('button', { name: /Search for/ }));

        expect(router.push).toHaveBeenCalledWith('/articles/search?q=docker');
    });

    it('opens an article when its suggestion is clicked', async () => {
        const { user } = renderModal();
        await user.type(screen.getByRole('combobox'), 'wire');
        await screen.findByRole('listbox');

        await user.click(
            screen.getByRole('button', { name: /WireGuard tunnels/ })
        );

        expect(router.push).toHaveBeenCalledWith('/articles/wireguard');
    });

    it('clears the query with the clear button', async () => {
        const { user } = renderModal('docker');
        const input = screen.getByRole('combobox');
        expect(input).toHaveValue('docker');

        await user.click(screen.getByRole('button', { name: 'Clear search' }));

        expect(input).toHaveValue('');
        expect(
            screen.queryByRole('button', { name: 'Clear search' })
        ).not.toBeInTheDocument();
    });

    it('closes on Escape', async () => {
        const { user, onClose } = renderModal();

        await user.keyboard('{Escape}');

        expect(onClose).toHaveBeenCalled();
    });

    it('closes on a backdrop click but not on a click inside the panel', async () => {
        const { user, onClose } = renderModal();

        await user.click(screen.getByRole('combobox'));
        expect(onClose).not.toHaveBeenCalled();

        await user.click(screen.getByRole('dialog'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('locks body scroll while open and restores it on unmount', () => {
        document.body.style.overflow = 'auto';
        const { unmount } = render(
            <SearchModal
                articles={articles}
                onClose={() => {}}
            />
        );
        expect(document.body.style.overflow).toBe('hidden');

        unmount();

        expect(document.body.style.overflow).toBe('auto');
        document.body.style.overflow = '';
    });
});
