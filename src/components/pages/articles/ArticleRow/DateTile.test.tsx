import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DateTile from '@/components/pages/articles/ArticleRow/DateTile';

describe('DateTile', () => {
    it('is a machine-readable time for the authored date', () => {
        const { container } = render(<DateTile date="2026-08-01" />);

        expect(container.querySelector('time')).toHaveAttribute(
            'datetime',
            '2026-08-01'
        );
    });

    it('shows the month, day and year as three calendar lines', () => {
        render(<DateTile date="2026-08-01" />);

        for (const line of ['AUG', '01', '2026']) {
            expect(screen.getByText(line)).toHaveAttribute(
                'aria-hidden',
                'true'
            );
        }
    });

    it('gives screen readers the readable date instead', () => {
        render(<DateTile date="2026-08-01" />);

        expect(screen.getByText('Aug 1, 2026')).toHaveClass('sr-only');
    });

    it('renders nothing for a malformed date', () => {
        const { container } = render(<DateTile date="not-a-date" />);

        expect(container).toBeEmptyDOMElement();
    });
});
