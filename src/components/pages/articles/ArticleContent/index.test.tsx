import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArticleContent from '@/components/pages/articles/ArticleContent';

vi.mock(
    '@/components/pages/articles/ArticleContent/ArticleContent.module.css',
    () => ({ default: { content: 'article-content' } })
);

function prose(container: HTMLElement): HTMLElement {
    return container.querySelector('.prose') as HTMLElement;
}

describe('ArticleContent', () => {
    it('renders the pre-built article HTML', () => {
        render(
            <ArticleContent
                html={'<h2 id="intro">Intro</h2><p>Body <code>text</code></p>'}
            />
        );

        expect(
            screen.getByRole('heading', { level: 2, name: 'Intro' })
        ).toHaveAttribute('id', 'intro');
        expect(screen.getByText('text').tagName).toBe('CODE');
    });

    it('wraps the HTML in the prose container with the module styles', () => {
        const { container } = render(<ArticleContent html="<p>Hello</p>" />);

        expect(prose(container)).toHaveClass(
            'prose',
            'article-content',
            'font-jetbrains-mono'
        );
    });

    it('exposes the cover accent when given', () => {
        const { container } = render(
            <ArticleContent
                html="<p>Hello</p>"
                accentColors={['#101010', '#202020']}
            />
        );

        expect(prose(container).style.getPropertyValue('--accent-from')).toBe(
            '#101010'
        );
        expect(prose(container).style.getPropertyValue('--accent-to')).toBe(
            '#202020'
        );
    });

    it('leaves the accent unset in the editor preview', () => {
        const { container } = render(<ArticleContent html="<p>Hello</p>" />);

        expect(prose(container).getAttribute('style')).toBeNull();
    });
});
