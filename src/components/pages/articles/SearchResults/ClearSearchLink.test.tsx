import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ClearSearchLink from '@/components/pages/articles/SearchResults/ClearSearchLink';

describe('ClearSearchLink', () => {
    it('goes back to every article', () => {
        render(<ClearSearchLink />);

        expect(
            screen.getByRole('link', { name: 'Clear search' })
        ).toHaveAttribute('href', '/articles');
    });
});
