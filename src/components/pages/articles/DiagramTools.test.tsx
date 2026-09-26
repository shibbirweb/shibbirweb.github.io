import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DiagramTools from '@/components/pages/articles/DiagramTools';

describe('DiagramTools', () => {
    it('offers Full view then Copy, in that order', () => {
        render(
            <DiagramTools
                source="graph TD; A-->B"
                onOpenFullView={() => {}}
            />
        );

        const labels = screen
            .getAllByRole('button')
            .map((button) => button.getAttribute('aria-label'));
        expect(labels).toEqual(['Full view', 'Copy diagram source']);
    });

    it('opens the full view from its button', async () => {
        const user = userEvent.setup();
        const onOpenFullView = vi.fn();
        render(
            <DiagramTools
                source="graph TD; A-->B"
                onOpenFullView={onOpenFullView}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Full view' }));

        expect(onOpenFullView).toHaveBeenCalledTimes(1);
    });
});
