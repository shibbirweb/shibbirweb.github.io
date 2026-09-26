import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SpotlightGroup from '@/components/pages/common/SpotlightGroup';

describe('SpotlightGroup', () => {
    it('wraps its children in a div with the caller class', () => {
        render(
            <SpotlightGroup className="contents">
                <article>Resume</article>
            </SpotlightGroup>
        );

        const wrapper = screen.getByRole('article').parentElement;
        expect(wrapper?.tagName).toBe('DIV');
        expect(wrapper).toHaveClass('contents');
    });
});
