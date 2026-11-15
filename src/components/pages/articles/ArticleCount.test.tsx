import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArticleCount from '@/components/pages/articles/ArticleCount';

describe('ArticleCount', () => {
    it.each([
        [0, '0 articles'],
        [1, '1 article'],
        [3, '3 articles'],
    ])('reads %i as "%s"', (count, label) => {
        render(<ArticleCount count={count} />);

        expect(screen.getByText(label)).toBeInTheDocument();
    });
});
