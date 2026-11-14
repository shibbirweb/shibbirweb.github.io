import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SkillChip from '@/components/pages/home/SkillsArea/SkillChip';

function renderChip(color?: string) {
    return render(
        <ul>
            <SkillChip skill={{ name: 'Claude', icon: 'claude', color }} />
        </ul>
    );
}

describe('SkillChip', () => {
    it('renders the skill name as a list item', () => {
        renderChip('#d97757');

        expect(screen.getByRole('listitem')).toHaveTextContent('Claude');
    });

    it('blooms the logo to the brand colour on hover', () => {
        renderChip('#d97757');

        const chip = screen.getByRole('listitem');
        expect(chip.style.getPropertyValue('--brand-color')).toBe('#d97757');
        expect(chip.querySelector('[data-skill-icon]')).toHaveClass(
            'group-hover:[color:var(--brand-color)]'
        );
    });

    it('blooms monochrome logos to the theme foreground', () => {
        renderChip();

        const chip = screen.getByRole('listitem');
        expect(chip.style.getPropertyValue('--brand-color')).toBe('');
        expect(chip.querySelector('[data-skill-icon]')).toHaveClass(
            'group-hover:text-foreground'
        );
    });

    it('hides the decorative logo from assistive technology', () => {
        renderChip('#d97757');

        expect(
            screen.getByRole('listitem').querySelector('[data-skill-icon]')
        ).toHaveAttribute('aria-hidden', 'true');
    });

    it('rests on a soft fill and shows its border only on hover', () => {
        renderChip('#d97757');

        expect(screen.getByRole('listitem')).toHaveClass(
            'border-transparent',
            'hover:border-foreground/25'
        );
    });

    it('is a spotlight surface with a lit edge, like the cards', () => {
        renderChip('#d97757');

        const chip = screen.getByRole('listitem');
        expect(chip).toHaveAttribute('data-spotlight-surface', 'true');
        expect(
            chip.querySelector(':scope > span[aria-hidden]:last-child')
        ).toHaveClass('absolute', '-inset-px', 'border');
    });

    it('shows the hand pointer', () => {
        renderChip('#d97757');

        expect(screen.getByRole('listitem')).toHaveClass('cursor-pointer');
    });
});
