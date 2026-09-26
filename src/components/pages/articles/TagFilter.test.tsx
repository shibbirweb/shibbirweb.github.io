import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TagFilter from '@/components/pages/articles/TagFilter';

describe('TagFilter', () => {
    it('renders nothing when there are no tags', () => {
        const { container } = render(
            <TagFilter
                tags={[]}
                active={null}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('links All to the unfiltered listing and each tag to its filter URL', () => {
        render(
            <TagFilter
                tags={['AI', 'Self Hosting']}
                active={null}
            />
        );

        expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute(
            'href',
            '/articles'
        );
        expect(screen.getByRole('link', { name: 'AI' })).toHaveAttribute(
            'href',
            '/articles?tag=AI'
        );
        expect(
            screen.getByRole('link', { name: 'Self Hosting' })
        ).toHaveAttribute('href', '/articles?tag=Self%20Hosting');
    });

    it('marks the active tag with aria-current and no other tag', () => {
        render(
            <TagFilter
                tags={['AI', 'Docker']}
                active="Docker"
            />
        );

        expect(screen.getByRole('link', { name: 'Docker' })).toHaveAttribute(
            'aria-current',
            'page'
        );
        expect(screen.getByRole('link', { name: 'AI' })).not.toHaveAttribute(
            'aria-current'
        );
    });

    it('styles All as selected only when no tag is active', () => {
        const { rerender } = render(
            <TagFilter
                tags={['AI']}
                active={null}
            />
        );
        expect(screen.getByRole('link', { name: 'All' })).toHaveClass(
            'bg-foreground'
        );

        rerender(
            <TagFilter
                tags={['AI']}
                active="AI"
            />
        );
        expect(screen.getByRole('link', { name: 'All' })).not.toHaveClass(
            'bg-foreground'
        );
        expect(screen.getByRole('link', { name: 'AI' })).toHaveClass(
            'bg-foreground'
        );
    });

    it('labels the navigation landmark', () => {
        render(
            <TagFilter
                tags={['AI']}
                active={null}
            />
        );

        expect(
            screen.getByRole('navigation', { name: 'Filter articles by tag' })
        ).toBeInTheDocument();
    });
});
