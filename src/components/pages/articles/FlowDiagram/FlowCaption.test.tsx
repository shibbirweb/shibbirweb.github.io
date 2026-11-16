import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FlowCaption from '@/components/pages/articles/FlowDiagram/FlowCaption';

describe('FlowCaption', () => {
    it('reads as one sentence once its styles are gone', () => {
        const { container } = render(
            <FlowCaption
                source="Router-wide"
                text="One address covers every device."
            />
        );

        expect(container.querySelector('p')).toHaveTextContent(
            'Router-wide: One address covers every device.'
        );
        expect(screen.getByText(':', { exact: false })).toHaveClass('sr-only');
    });

    it('announces caption changes politely', () => {
        const { container } = render(
            <FlowCaption
                source="Step 1"
                text="The phone asks the router."
            />
        );

        expect(container.querySelector('p')).toHaveAttribute(
            'aria-live',
            'polite'
        );
    });
});
