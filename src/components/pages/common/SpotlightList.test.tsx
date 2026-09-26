import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SpotlightList from '@/components/pages/common/SpotlightList';

describe('SpotlightList', () => {
    it('renders its children inside a list with the caller class', () => {
        render(
            <SpotlightList className="grid gap-6">
                <li>First</li>
                <li>Second</li>
            </SpotlightList>
        );

        const list = screen.getByRole('list');
        expect(list).toHaveClass('grid', 'gap-6');
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
});
