import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleRowTags, {
    teaserTagLimit,
} from '@/components/pages/home/ArticlesArea/ArticleRow/ArticleRowTags';

const tags = ['Laravel', 'MySQL', 'Database Collation', 'Debugging', 'Backend'];

describe('ArticleRowTags', () => {
    it('is a list named for assistive tech', () => {
        render(<ArticleRowTags tags={tags} />);

        expect(screen.getByRole('list', { name: 'Tags' })).toBeInTheDocument();
    });

    it(`shows only the first ${teaserTagLimit} tags as #handles`, () => {
        render(<ArticleRowTags tags={tags} />);

        expect(
            screen.getAllByRole('link').map((link) => link.textContent)
        ).toEqual(['#laravel', '#mysql', '#database-collation']);
    });

    it('links each tag to the articles list filtered by the real tag', () => {
        render(<ArticleRowTags tags={tags} />);

        expect(
            screen.getByRole('link', { name: '#database-collation' })
        ).toHaveAttribute('href', '/articles?tag=Database%20Collation');
    });

    it('shows every tag when there are fewer than the limit', () => {
        render(<ArticleRowTags tags={['Git']} />);

        expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('sits above the row link so the tags stay clickable', () => {
        render(<ArticleRowTags tags={tags} />);

        expect(screen.getByRole('list', { name: 'Tags' })).toHaveClass(
            'relative',
            'z-10'
        );
    });
});
