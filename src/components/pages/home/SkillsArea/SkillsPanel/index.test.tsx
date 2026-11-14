import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SkillsPanel from '@/components/pages/home/SkillsArea/SkillsPanel';

describe('SkillsPanel', () => {
    it('holds both halves of the section on one borderless backdrop', () => {
        render(
            <SkillsPanel>
                <h3>AI Engineering</h3>
                <h3>Full-stack foundation</h3>
            </SkillsPanel>
        );

        const panel = screen
            .getByRole('heading', { name: 'AI Engineering' })
            .closest('[data-skills-panel]');
        expect(panel).not.toBeNull();
        expect(panel).not.toHaveClass('border');
        expect(panel).toContainElement(
            screen.getByRole('heading', { name: 'Full-stack foundation' })
        );
    });
});
