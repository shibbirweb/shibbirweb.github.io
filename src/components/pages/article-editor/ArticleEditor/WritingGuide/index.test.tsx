import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import WritingGuide from '@/components/pages/article-editor/ArticleEditor/WritingGuide';
import { guideGroups } from '@/components/pages/article-editor/ArticleEditor/WritingGuide/contents';

function renderGuide() {
    const callbacks = {
        onClose: vi.fn(),
        onInsert: vi.fn(),
        onLoadExample: vi.fn(),
    };
    render(<WritingGuide {...callbacks} />);
    return { ...callbacks, user: userEvent.setup() };
}

function guideEntry(label: string): HTMLElement {
    const labelElement = screen.getByText(label, { selector: 'p' });
    return labelElement.closest('div.rounded-xl') as HTMLElement;
}

describe('WritingGuide', () => {
    it('opens as a labelled modal dialog with focus on Close', () => {
        renderGuide();

        const dialog = screen.getByRole('dialog', { name: 'Writing guide' });
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });

    it('lists every guide group as a section heading', () => {
        renderGuide();

        const headings = screen
            .getAllByRole('heading', { level: 3 })
            .map((heading) => heading.textContent);
        expect(headings).toEqual(guideGroups.map((group) => group.title));
    });

    it('offers Insert only for body features, not frontmatter fields', () => {
        renderGuide();

        const insertable = guideGroups
            .flatMap((group) => group.entries)
            .filter((entry) => entry.insert);
        expect(screen.getAllByRole('button', { name: 'Insert' })).toHaveLength(
            insertable.length
        );
        expect(
            within(guideEntry('title')).queryByRole('button', {
                name: 'Insert',
            })
        ).not.toBeInTheDocument();
    });

    it('calls onInsert with the entry insert text', async () => {
        const { onInsert, user } = renderGuide();
        const entry = guideGroups
            .flatMap((group) => group.entries)
            .find((candidate) => candidate.insert);

        await user.click(
            within(guideEntry(entry!.label)).getByRole('button', {
                name: 'Insert',
            })
        );

        expect(onInsert).toHaveBeenCalledWith(entry!.insert);
    });

    it('loads the full example', async () => {
        const { onLoadExample, user } = renderGuide();

        await user.click(
            screen.getByRole('button', { name: 'Load full example' })
        );

        expect(onLoadExample).toHaveBeenCalledTimes(1);
    });

    it('closes from Close, Escape, and the backdrop', async () => {
        const { onClose, user } = renderGuide();

        await user.click(screen.getByRole('button', { name: 'Close' }));
        await user.keyboard('{Escape}');
        await user.click(screen.getByRole('dialog'));

        expect(onClose).toHaveBeenCalledTimes(3);
    });

    it('copies a snippet and briefly confirms', async () => {
        const { user } = renderGuide();
        const entry = guideGroups
            .flatMap((group) => group.entries)
            .find((candidate) => candidate.insert)!;
        const row = guideEntry(entry.label);

        await user.click(within(row).getByRole('button', { name: 'Copy' }));

        expect(await navigator.clipboard.readText()).toBe(entry.snippet);
        expect(
            within(row).getByRole('button', { name: 'Copied' })
        ).toBeInTheDocument();
    });
});
