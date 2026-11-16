import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TocRailLine from '@/components/pages/articles/TableOfContents/TocRail/TocRailLine';
import type { RailItem } from '@/components/pages/articles/TableOfContents/TocRail/railPath';

const items: RailItem[] = [
    { top: 0, bottom: 30, depth: 0 },
    { top: 30, bottom: 60, depth: 0 },
    { top: 60, bottom: 90, depth: 0 },
];

describe('TocRailLine', () => {
    it('renders nothing before the entries are measured', () => {
        const { container } = render(
            <TocRailLine
                items={[]}
                visibleIndexes={[]}
                direction="down"
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('is decorative and sized to the list', () => {
        render(
            <TocRailLine
                items={items}
                visibleIndexes={[1]}
                direction="down"
            />
        );

        const rail = screen.getByTestId('toc-rail');
        expect(rail).toHaveAttribute('aria-hidden');
        expect(rail.style.height).toBe('90px');
    });

    it('clips the highlight to the visible entries', () => {
        render(
            <TocRailLine
                items={items}
                visibleIndexes={[1]}
                direction="down"
            />
        );

        const thumb = screen.getByTestId('toc-rail-thumb');
        expect(thumb.style.clipPath).toBe('inset(30px -4px 30px -4px)');
        expect(thumb).toHaveClass('opacity-100');
    });

    it('puts the head on the bottom end while scrolling down', () => {
        render(
            <TocRailLine
                items={items}
                visibleIndexes={[1]}
                direction="down"
            />
        );

        expect(screen.getByTestId('toc-rail-head').style.transform).toBe(
            'translate(-2px, 57px)'
        );
    });

    it('puts the head on the top end while scrolling up', () => {
        render(
            <TocRailLine
                items={items}
                visibleIndexes={[1]}
                direction="up"
            />
        );

        expect(screen.getByTestId('toc-rail-head').style.transform).toBe(
            'translate(-2px, 27px)'
        );
    });

    it('hides the highlight and head when nothing is visible', () => {
        render(
            <TocRailLine
                items={items}
                visibleIndexes={[]}
                direction="down"
            />
        );

        expect(screen.getByTestId('toc-rail-thumb')).toHaveClass('opacity-0');
        expect(screen.getByTestId('toc-rail-head')).toHaveClass('opacity-0');
    });
});
