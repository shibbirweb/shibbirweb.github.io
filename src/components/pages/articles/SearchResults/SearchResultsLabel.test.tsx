import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SearchResultsLabel from '@/components/pages/articles/SearchResults/SearchResultsLabel';

describe('SearchResultsLabel', () => {
    it('leads with the count and quotes the query', () => {
        const { container } = render(
            <SearchResultsLabel
                count={3}
                query="git"
            />
        );

        expect(container).toHaveTextContent('3 articles found for “git”');
    });

    it('sets the query apart from the lead-in', () => {
        render(
            <SearchResultsLabel
                count={1}
                query="git"
            />
        );

        expect(screen.getByText('“git”')).toHaveClass('font-medium');
    });

    it('reads "No articles found" for zero matches', () => {
        const { container } = render(
            <SearchResultsLabel
                count={0}
                query="zzz"
            />
        );

        expect(container).toHaveTextContent('No articles found for “zzz”');
    });
});
