import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FlowDiagram from '@/components/pages/articles/FlowDiagram/FlowDiagram';
import { parseFlowDiagram } from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';

const definition = parseFlowDiagram(
    [
        'title: Phone to Pi-hole',
        'scenario "Router-wide"',
        'Phone --> Pi-hole (DNS query)',
    ].join('\n')
);

const STATIC_HINT =
    'Press Interactive to step through the diagram a piece at a time.';

describe('FlowDiagram', () => {
    it('describes the figure with the control hint, for screen readers', () => {
        render(<FlowDiagram definition={definition} />);

        expect(screen.getByRole('figure')).toHaveAccessibleDescription(
            STATIC_HINT
        );
    });

    it('hides the hint itself, so reading modes do not show it without controls', () => {
        render(<FlowDiagram definition={definition} />);

        const hint = screen.getByText(STATIC_HINT);
        expect(hint).toHaveAttribute('aria-hidden', 'true');
        expect(screen.getByRole('figure')).toHaveAttribute(
            'aria-describedby',
            hint.id
        );
    });
});
