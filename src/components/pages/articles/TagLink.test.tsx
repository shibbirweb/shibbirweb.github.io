import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TagLink from '@/components/pages/articles/TagLink';

describe('TagLink', () => {
    it('renders a list item linking to the tag filter', () => {
        render(
            <ul>
                <TagLink tag="Next.js" />
            </ul>
        );

        expect(screen.getByRole('listitem')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Next.js' })).toHaveAttribute(
            'href',
            '/articles?tag=Next.js'
        );
    });

    it('URL-encodes tags with spaces and symbols', () => {
        render(
            <ul>
                <TagLink tag="C# & .NET" />
            </ul>
        );

        expect(screen.getByRole('link', { name: 'C# & .NET' })).toHaveAttribute(
            'href',
            '/articles?tag=C%23%20%26%20.NET'
        );
    });

    it('merges extra classes onto the link', () => {
        render(
            <ul>
                <TagLink
                    tag="AI"
                    className="px-3 py-1"
                />
            </ul>
        );

        expect(screen.getByRole('link', { name: 'AI' })).toHaveClass(
            'rounded-full',
            'px-3',
            'py-1'
        );
    });
});
