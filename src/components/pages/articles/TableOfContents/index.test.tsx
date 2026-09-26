import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TableOfContents from '@/components/pages/articles/TableOfContents';
import type { TocItem } from '@/lib/posts';

const toc: TocItem[] = [
    { id: 'intro', text: 'Intro', level: 2 },
    { id: 'details', text: 'Details', level: 3 },
];

function addHeading(id: string) {
    const heading = document.createElement('h2');
    heading.id = id;
    document.body.appendChild(heading);
}

const originalScrollTo = Element.prototype.scrollTo;

beforeEach(() => {
    // jsdom does not implement element scrolling.
    Element.prototype.scrollTo = vi.fn();
});

afterEach(() => {
    Element.prototype.scrollTo = originalScrollTo;
    document.querySelectorAll('h2[id]').forEach((heading) => heading.remove());
});

describe('TableOfContents', () => {
    it('renders nothing when the article has no headings', () => {
        const { container } = render(
            <TableOfContents
                toc={[]}
                accentColors={['#000000', '#ffffff']}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders a labelled nav listing every heading', () => {
        render(
            <TableOfContents
                toc={toc}
                accentColors={['#000000', '#ffffff']}
            />
        );

        const nav = screen.getByRole('navigation', {
            name: 'Table of contents',
        });
        expect(nav).toHaveTextContent('On this page');
        expect(screen.getAllByRole('link')).toHaveLength(2);
    });

    it('highlights the heading the scroll spy reports as current', () => {
        // With no layout every heading sits at the top of the viewport, so the
        // last one present is the one the reader is "in".
        addHeading('intro');
        addHeading('details');

        render(
            <TableOfContents
                toc={toc}
                accentColors={['#000000', '#ffffff']}
            />
        );

        expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute(
            'aria-current',
            'location'
        );
    });

    it('tints the nav with the article accent', () => {
        render(
            <TableOfContents
                toc={toc}
                accentColors={['#abcdef', '#fedcba']}
            />
        );

        const nav = screen.getByRole('navigation');
        expect(nav.style.getPropertyValue('--accent-to')).toBe('#fedcba');
    });
});
