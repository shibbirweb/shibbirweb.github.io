import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleCover from '@/components/pages/articles/ArticleCover';

describe('ArticleCover', () => {
    it('is decorative by default (empty alt)', () => {
        const { container } = render(
            <ArticleCover src="/images/articles/cover.svg" />
        );

        const image = container.querySelector('img');
        expect(image).toHaveAttribute('alt', '');
    });

    it('uses the given alt text and source unchanged', () => {
        render(
            <ArticleCover
                src="/images/articles/cover.png"
                alt="A rack of servers"
            />
        );

        const image = screen.getByRole('img', { name: 'A rack of servers' });
        expect(image.getAttribute('src')).toContain(
            '/images/articles/cover.png'
        );
    });

    it('reserves the 1200x630 cover aspect and merges extra classes', () => {
        render(
            <ArticleCover
                src="/images/articles/cover.png"
                alt="Cover"
                className="rounded-2xl"
            />
        );

        const image = screen.getByRole('img', { name: 'Cover' });
        expect(image).toHaveAttribute('width', '1200');
        expect(image).toHaveAttribute('height', '630');
        expect(image).toHaveClass('w-full', 'object-cover', 'rounded-2xl');
    });
});
