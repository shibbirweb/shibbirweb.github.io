import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Spinner from '@/components/ui/Spinner';

describe('Spinner', () => {
    it('is decorative without a label', () => {
        const { container } = render(<Spinner />);

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(container.querySelector('svg')).toHaveAttribute(
            'aria-hidden',
            'true'
        );
    });

    it('is announced as a status when labelled', () => {
        render(<Spinner label="Loading comments" />);

        const spinner = screen.getByRole('status', {
            name: 'Loading comments',
        });
        expect(spinner).not.toHaveAttribute('aria-hidden');
    });

    it('merges classes and forwards SVG props', () => {
        const { container } = render(
            <Spinner
                className="size-6"
                data-testid="spinner"
            />
        );

        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('size-6', 'motion-safe:animate-spin');
        expect(svg).not.toHaveClass('size-4');
        expect(svg).toHaveAttribute('data-testid', 'spinner');
    });
});
