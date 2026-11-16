import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TocRail from '@/components/pages/articles/TableOfContents/TocRail';
import type { TocItem } from '@/lib/posts';

const toc: TocItem[] = [
    { id: 'why-self-host', text: 'Why self-host', level: 2 },
    { id: 'the-hardware', text: 'The hardware', level: 3 },
    { id: 'wrapping-up', text: 'Wrapping up', level: 2 },
];

describe('TocRail', () => {
    it('lists every heading in order', () => {
        render(
            <TocRail
                toc={toc}
                currentId={null}
                visibleIds={[]}
                direction="down"
            />
        );

        expect(
            screen.getAllByRole('link').map((link) => link.textContent)
        ).toEqual(['Why self-host', 'The hardware', 'Wrapping up']);
    });

    it('brightens every visible section and marks the current one', () => {
        render(
            <TocRail
                toc={toc}
                currentId="the-hardware"
                visibleIds={['why-self-host', 'the-hardware']}
                direction="down"
            />
        );

        expect(screen.getByRole('link', { name: 'Why self-host' })).toHaveClass(
            'text-foreground'
        );
        expect(
            screen.getByRole('link', { name: 'The hardware' })
        ).toHaveAttribute('aria-current', 'location');
        expect(screen.getByRole('link', { name: 'Wrapping up' })).toHaveClass(
            'text-foreground/55'
        );
    });

    it('draws the rail once the entries are measured', () => {
        render(
            <TocRail
                toc={toc}
                currentId={null}
                visibleIds={['why-self-host']}
                direction="down"
            />
        );

        expect(screen.getByTestId('toc-rail')).toBeInTheDocument();
    });
});
