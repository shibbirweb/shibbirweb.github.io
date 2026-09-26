import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GithubIcon from '@/components/icons/github';
import SkillCard from '@/components/pages/home/SkillsArea/SkillCard';

function renderSkill(color?: string) {
    return render(
        <ul>
            <SkillCard skill={{ name: 'GitHub', Icon: GithubIcon, color }} />
        </ul>
    );
}

describe('SkillCard', () => {
    it('renders the skill name as a list item', () => {
        renderSkill('#3178c6');

        expect(screen.getByRole('listitem')).toHaveTextContent('GitHub');
    });

    it('exposes the brand colour as --brand-color', () => {
        renderSkill('#3178c6');

        expect(
            screen.getByRole('listitem').style.getPropertyValue('--brand-color')
        ).toBe('#3178c6');
    });

    it('sets no brand colour for monochrome logos', () => {
        renderSkill();

        const tile = screen.getByRole('listitem');
        expect(tile.style.getPropertyValue('--brand-color')).toBe('');
        expect(tile.querySelector('svg')).toHaveClass(
            'group-hover:text-foreground'
        );
    });

    it('marks itself as a spotlight surface', () => {
        renderSkill('#3178c6');

        expect(screen.getByRole('listitem')).toHaveAttribute(
            'data-spotlight-surface',
            'true'
        );
    });
});
