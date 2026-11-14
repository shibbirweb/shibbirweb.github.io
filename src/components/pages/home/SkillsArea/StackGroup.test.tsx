import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StackGroup from '@/components/pages/home/SkillsArea/StackGroup';

const group = {
    title: 'Tooling & mobile',
    skills: [
        { name: 'Git', icon: 'git', color: '#F05032' },
        { name: 'GitHub', icon: 'github' },
    ],
};

function renderGroup() {
    render(
        <ul>
            <StackGroup group={group} />
        </ul>
    );
}

describe('StackGroup', () => {
    it('labels the row with its title', () => {
        renderGroup();

        expect(
            screen.getByRole('heading', { name: 'Tooling & mobile' })
        ).toBeVisible();
    });

    it('lists every skill as a chip named by the row heading', () => {
        renderGroup();

        const chips = screen.getByRole('list', { name: 'Tooling & mobile' });
        expect(
            within(chips)
                .getAllByRole('listitem')
                .map((chip) => chip.textContent)
        ).toEqual(['Git', 'GitHub']);
    });

    it('derives a readable heading id from the title', () => {
        renderGroup();

        expect(
            screen.getByRole('heading', { name: 'Tooling & mobile' })
        ).toHaveAttribute('id', 'stack-tooling-mobile');
    });
});
