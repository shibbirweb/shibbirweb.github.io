import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FiltersButton from '@/components/pages/articles/ArticlesBrowse/FiltersButton';

function renderButton(props: Partial<Parameters<typeof FiltersButton>[0]>) {
    return render(
        <FiltersButton
            isOpen={false}
            hasActiveFilter={false}
            panelId="topic-filters"
            onToggle={vi.fn()}
            {...props}
        />
    );
}

describe('FiltersButton', () => {
    it('controls the topic panel and reports whether it is open', () => {
        const { rerender } = renderButton({});

        const button = screen.getByRole('button', { name: 'Filters' });
        expect(button).toHaveAttribute('aria-controls', 'topic-filters');
        expect(button).toHaveAttribute('aria-expanded', 'false');

        rerender(
            <FiltersButton
                isOpen
                hasActiveFilter={false}
                panelId="topic-filters"
                onToggle={vi.fn()}
            />
        );
        expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows how many filters are applied', () => {
        renderButton({ hasActiveFilter: true });

        expect(
            screen.getByRole('button', { name: 'Filters, 1 applied' })
        ).toBeInTheDocument();
    });

    it('calls onToggle when pressed', async () => {
        const onToggle = vi.fn();
        renderButton({ onToggle });

        await userEvent.setup().click(screen.getByRole('button'));

        expect(onToggle).toHaveBeenCalledOnce();
    });
});
