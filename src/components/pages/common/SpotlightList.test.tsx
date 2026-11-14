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

    it('takes its accessible name from a heading when given one', () => {
        render(
            <>
                <h4 id="toolkit-heading">Toolkit</h4>
                <SpotlightList
                    className="flex"
                    labelledBy="toolkit-heading"
                >
                    <li>Claude</li>
                </SpotlightList>
            </>
        );

        expect(screen.getByRole('list', { name: 'Toolkit' })).toBeVisible();
    });
});
