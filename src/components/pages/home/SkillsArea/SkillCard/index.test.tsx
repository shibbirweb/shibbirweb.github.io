import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SkillCard from '@/components/pages/home/SkillsArea/SkillCard';

function renderSkill(color?: string) {
    return render(
        <ul>
            <SkillCard
                skill={{
                    name: 'MCP',
                    icon: 'mcp',
                    color,
                    summary: 'Servers that expose apps to AI clients.',
                }}
            />
        </ul>
    );
}

describe('SkillCard', () => {
    it('renders the skill name as a heading inside a list item', () => {
        renderSkill('#8b5cf6');

        expect(
            screen.getByRole('listitem').querySelector('h4')
        ).toHaveTextContent('MCP');
        expect(screen.getByRole('heading', { name: 'MCP' })).toBeVisible();
    });

    it('shows the one-line summary', () => {
        renderSkill('#8b5cf6');

        expect(
            screen.getByText('Servers that expose apps to AI clients.')
        ).toBeVisible();
    });

    it('exposes the brand colour as --brand-color', () => {
        renderSkill('#8b5cf6');

        expect(
            screen.getByRole('listitem').style.getPropertyValue('--brand-color')
        ).toBe('#8b5cf6');
    });

    it('falls back to the theme foreground for monochrome logos', () => {
        renderSkill();

        const card = screen.getByRole('listitem');
        expect(card.style.getPropertyValue('--brand-color')).toBe('');
        expect(card.querySelector('[data-skill-icon]')).toHaveClass(
            '[color:var(--brand-color,var(--foreground))]'
        );
    });

    it('marks itself as a spotlight surface', () => {
        renderSkill('#8b5cf6');

        expect(screen.getByRole('listitem')).toHaveAttribute(
            'data-spotlight-surface',
            'true'
        );
    });

    it('has a border that brightens on hover, like the project cards', () => {
        renderSkill('#8b5cf6');

        expect(screen.getByRole('listitem')).toHaveClass(
            'border',
            'border-foreground/10',
            'hover:border-foreground/30'
        );
    });

    it('lights its border near the cursor with a SpotlightBorder', () => {
        renderSkill('#8b5cf6');

        const litEdge = screen
            .getByRole('listitem')
            .querySelector(':scope > span[aria-hidden]:last-child');
        expect(litEdge).toHaveClass('absolute', '-inset-px', 'border');
    });

    it('shows the hand pointer', () => {
        renderSkill('#8b5cf6');

        expect(screen.getByRole('listitem')).toHaveClass('cursor-pointer');
    });
});
