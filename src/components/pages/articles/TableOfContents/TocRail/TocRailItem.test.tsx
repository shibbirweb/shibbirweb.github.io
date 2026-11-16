import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TocRailItem from '@/components/pages/articles/TableOfContents/TocRail/TocRailItem';

function renderItem(level: number, isCurrent = false, isVisible = false) {
    render(
        <ul>
            <TocRailItem
                item={{ id: 'the-hardware', text: 'The hardware', level }}
                isCurrent={isCurrent}
                isVisible={isVisible}
            />
        </ul>
    );
    return screen.getByRole('link', { name: 'The hardware' });
}

describe('TocRailItem', () => {
    it('links to the heading anchor', () => {
        expect(renderItem(2)).toHaveAttribute('href', '#the-hardware');
    });

    it('records its depth for the rail and indents H3s further', () => {
        const link = renderItem(3);

        expect(link).toHaveAttribute('data-toc-depth', '1');
        expect(link).toHaveClass('pl-7');
    });

    it('keeps H2s at the base indent', () => {
        const link = renderItem(2);

        expect(link).toHaveAttribute('data-toc-depth', '0');
        expect(link).toHaveClass('pl-4');
    });

    it('marks only the current heading for assistive tech', () => {
        expect(renderItem(2, true)).toHaveAttribute('aria-current', 'location');
    });

    it('reads bright while its section is on screen', () => {
        expect(renderItem(2, false, true)).toHaveClass('text-foreground');
    });

    it('stays muted while its section is off screen', () => {
        expect(renderItem(2)).toHaveClass('text-foreground/55');
    });
});
