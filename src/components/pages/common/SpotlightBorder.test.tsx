import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';

describe('SpotlightBorder', () => {
    it('renders a decorative, non-interactive ring with the caller class', () => {
        const { container } = render(
            <SpotlightBorder className="spotlight-ring" />
        );

        const ring = container.firstElementChild;
        expect(ring).toHaveAttribute('aria-hidden', 'true');
        expect(ring).toHaveClass(
            'pointer-events-none',
            'absolute',
            'spotlight-ring'
        );
        expect(ring).toBeEmptyDOMElement();
    });
});
