import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ReadingProgress from '@/components/pages/articles/ReadingProgress';

afterEach(() => {
    vi.restoreAllMocks();
    document.querySelector('article')?.remove();
});

describe('ReadingProgress', () => {
    it('exposes a labelled 0 to 100 progressbar', () => {
        render(<ReadingProgress accentColors={['#000000', '#ffffff']} />);

        const bar = screen.getByRole('progressbar', {
            name: 'Reading progress',
        });
        expect(bar).toHaveAttribute('aria-valuemin', '0');
        expect(bar).toHaveAttribute('aria-valuemax', '100');
        expect(bar).toHaveAttribute('aria-valuenow', '0');
    });

    it('reports the rounded percentage and scales the fill to match', () => {
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
        const article = document.createElement('article');
        vi.spyOn(article, 'getBoundingClientRect').mockReturnValue({
            top: -1000,
            height: 3800,
        } as DOMRect);
        document.body.appendChild(article);

        render(<ReadingProgress accentColors={['#000000', '#ffffff']} />);

        const bar = screen.getByRole('progressbar');
        // 1000 of 3000 scrollable pixels is a third.
        expect(bar).toHaveAttribute('aria-valuenow', '33');
        const fill = bar.firstElementChild as HTMLElement;
        expect(fill.style.transform).toBe(`scaleX(${1000 / 3000})`);
    });

    it('tints the bar with the article accent', () => {
        render(<ReadingProgress accentColors={['#abcdef', '#123456']} />);

        const bar = screen.getByRole('progressbar');
        expect(bar.style.getPropertyValue('--accent-from')).toBe('#abcdef');
    });
});
