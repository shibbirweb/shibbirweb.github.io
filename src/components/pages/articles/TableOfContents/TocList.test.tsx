import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TocList from '@/components/pages/articles/TableOfContents/TocList';
import type { TocItem } from '@/lib/posts';

const toc: TocItem[] = [
    { id: 'why-self-host', text: 'Why self-host', level: 2 },
    { id: 'the-hardware', text: 'The hardware', level: 3 },
    { id: 'wrapping-up', text: 'Wrapping up', level: 2 },
];

describe('TocList', () => {
    it('links each heading to its anchor', () => {
        render(
            <TocList
                toc={toc}
                activeId={null}
            />
        );

        expect(
            screen.getByRole('link', { name: 'Why self-host' })
        ).toHaveAttribute('href', '#why-self-host');
        expect(
            screen.getByRole('link', { name: 'The hardware' })
        ).toHaveAttribute('href', '#the-hardware');
    });

    it('indents H3 entries under their H2', () => {
        render(
            <TocList
                toc={toc}
                activeId={null}
            />
        );

        expect(screen.getByRole('link', { name: 'The hardware' })).toHaveClass(
            'pl-5'
        );
        expect(screen.getByRole('link', { name: 'Why self-host' })).toHaveClass(
            'pl-2'
        );
    });

    it('marks only the active heading with aria-current="location"', () => {
        render(
            <TocList
                toc={toc}
                activeId="the-hardware"
            />
        );

        expect(
            screen.getByRole('link', { name: 'The hardware' })
        ).toHaveAttribute('aria-current', 'location');
        expect(
            screen.getByRole('link', { name: 'Why self-host' })
        ).not.toHaveAttribute('aria-current');
        expect(
            screen.getByRole('link', { name: 'Wrapping up' })
        ).not.toHaveAttribute('aria-current');
    });

    it('calls onNavigate when a heading is picked', async () => {
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        render(
            <TocList
                toc={toc}
                activeId={null}
                onNavigate={onNavigate}
            />
        );

        await user.click(screen.getByRole('link', { name: 'Wrapping up' }));

        expect(onNavigate).toHaveBeenCalledTimes(1);
    });
});
