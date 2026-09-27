import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DiagramSourceFallback from '@/components/pages/articles/DiagramSourceFallback';

describe('DiagramSourceFallback', () => {
    it('shows the diagram source as preformatted text', () => {
        render(<DiagramSourceFallback source={'flowchart LR\n  A --> B'} />);
        const fallback = screen.getByLabelText('Diagram source');

        expect(fallback.tagName).toBe('PRE');
        expect(fallback).toHaveTextContent('flowchart LR A --> B');
    });

    it('can be reached with the keyboard, so a scrolling box can be scrolled', () => {
        render(<DiagramSourceFallback source="graph TD" />);

        expect(screen.getByLabelText('Diagram source')).toHaveAttribute(
            'tabindex',
            '0'
        );
    });

    it('keeps the shared focus ring alongside the look passed in', () => {
        render(
            <DiagramSourceFallback
                source="graph TD"
                className="my-look"
            />
        );
        const fallback = screen.getByLabelText('Diagram source');

        expect(fallback).toHaveClass('focus-ring');
        expect(fallback).toHaveClass('my-look');
    });
});
