import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SkillIcon from '@/components/pages/home/SkillsArea/SkillIcon';

function renderIcon() {
    const { container } = render(
        <SkillIcon
            icon="claude"
            className="size-4"
        />
    );
    return container.querySelector('span') as HTMLSpanElement;
}

describe('SkillIcon', () => {
    it('names its logo file in a custom property instead of inlining it', () => {
        const icon = renderIcon();

        expect(icon.style.getPropertyValue('--skill-icon-url')).toBe(
            'url(/icons/skills/claude.svg)'
        );
        expect(icon.querySelector('svg')).toBeNull();
    });

    it('is decorative, so assistive technology reads the skill name instead', () => {
        expect(renderIcon()).toHaveAttribute('aria-hidden', 'true');
    });

    it('tags itself with the logo name and keeps the caller classes', () => {
        const icon = renderIcon();

        expect(icon).toHaveAttribute('data-skill-icon', 'claude');
        expect(icon).toHaveClass('size-4');
    });
});
