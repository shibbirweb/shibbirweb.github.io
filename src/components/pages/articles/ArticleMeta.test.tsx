import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleMeta from '@/components/pages/articles/ArticleMeta';

describe('ArticleMeta', () => {
    it('shows the formatted publish date and the reading time', () => {
        const { container } = render(
            <ArticleMeta
                date="2026-03-14"
                readingMinutes={6}
            />
        );

        const time = container.querySelector('time');
        expect(time).toHaveAttribute('dateTime', '2026-03-14');
        expect(time).toHaveTextContent('Mar 14, 2026');
        expect(screen.getByText('6 min read')).toBeInTheDocument();
    });

    it('shows an Updated stamp when the revision date differs', () => {
        const { container } = render(
            <ArticleMeta
                date="2026-03-14"
                updated="2026-04-02"
                readingMinutes={6}
            />
        );

        expect(screen.getByText(/Updated/)).toHaveTextContent(
            'Updated Apr 2, 2026'
        );
        expect(container.querySelectorAll('time')[1]).toHaveAttribute(
            'dateTime',
            '2026-04-02'
        );
    });

    it('omits Updated when it equals the publish date', () => {
        render(
            <ArticleMeta
                date="2026-03-14"
                updated="2026-03-14"
                readingMinutes={6}
            />
        );

        expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
    });

    it('omits Updated when there is no revision date', () => {
        render(
            <ArticleMeta
                date="2026-03-14"
                readingMinutes={6}
            />
        );

        expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
    });

    it('shows the difficulty badge only when a level is set', () => {
        const { rerender } = render(
            <ArticleMeta
                date="2026-03-14"
                readingMinutes={6}
            />
        );
        expect(screen.queryByText('Advanced')).not.toBeInTheDocument();

        rerender(
            <ArticleMeta
                date="2026-03-14"
                readingMinutes={6}
                difficulty="Advanced"
            />
        );
        expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    it('drops the date element when the date is empty', () => {
        const { container } = render(
            <ArticleMeta
                date=""
                readingMinutes={2}
            />
        );

        expect(container.querySelector('time')).toBeNull();
        expect(screen.getByText('2 min read')).toBeInTheDocument();
    });
});
