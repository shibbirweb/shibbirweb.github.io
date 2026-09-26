import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SignatureSpotlight from '@/components/layout/Footer/SignatureSpotlight';

vi.mock(
    '@/components/layout/Footer/SignatureSpotlight/githubActivityStore',
    () => ({ watchGithubActivity: vi.fn(() => () => {}) })
);

describe('SignatureSpotlight', () => {
    beforeEach(() => {
        // jsdom has no canvas backend; the graph simply skips drawing.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
            null
        );
    });

    it('stacks the solid wordmark and the activity graph canvas', () => {
        const { container } = render(<SignatureSpotlight />);

        expect(container.querySelector('svg path')).not.toBeNull();
        expect(container.querySelector('canvas')).not.toBeNull();
    });

    it('is decorative, so screen readers skip both layers', () => {
        const { container } = render(<SignatureSpotlight />);
        const svg = container.querySelector('svg');
        const graphLayer = container.querySelector('canvas')?.parentElement;

        expect(svg).toHaveAttribute('aria-hidden', 'true');
        expect(graphLayer).toHaveAttribute('aria-hidden', 'true');
        expect(container).toHaveTextContent('');
    });

    it('never blocks clicks on the page behind the graph layer', () => {
        const { container } = render(<SignatureSpotlight />);
        const graphLayer = container.querySelector('canvas')?.parentElement;

        expect(graphLayer?.className).toContain('pointer-events-none');
    });
});
