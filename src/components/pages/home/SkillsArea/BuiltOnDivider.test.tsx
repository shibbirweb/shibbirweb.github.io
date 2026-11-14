import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BuiltOnDivider from '@/components/pages/home/SkillsArea/BuiltOnDivider';
import { builtOnLabel } from '@/components/pages/home/SkillsArea/contents';

describe('BuiltOnDivider', () => {
    it('joins the two halves with a readable "Built on" label', () => {
        render(<BuiltOnDivider />);

        expect(screen.getByText(builtOnLabel)).toBeVisible();
    });

    it('hides the decorative hairlines from assistive technology', () => {
        const { container } = render(<BuiltOnDivider />);

        const hairlines = container.querySelectorAll('[aria-hidden="true"]');
        expect(hairlines).toHaveLength(2);
        for (const hairline of hairlines) {
            expect(hairline).toBeEmptyDOMElement();
        }
    });
});
