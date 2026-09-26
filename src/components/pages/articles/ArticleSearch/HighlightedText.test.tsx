import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HighlightedText from '@/components/pages/articles/ArticleSearch/HighlightedText';

function markedParts(container: HTMLElement): string[] {
    return Array.from(container.querySelectorAll('mark')).map(
        (mark) => mark.textContent ?? ''
    );
}

describe('HighlightedText', () => {
    it('wraps each case-insensitive match in a <mark>', () => {
        const { container } = render(
            <HighlightedText
                text="Docker on the Pi: docker compose"
                terms={['docker']}
            />
        );

        expect(markedParts(container)).toEqual(['Docker', 'docker']);
        expect(container).toHaveTextContent('Docker on the Pi: docker compose');
    });

    it('highlights several terms at once', () => {
        const { container } = render(
            <HighlightedText
                text="Self hosting with WireGuard"
                terms={['self', 'wire']}
            />
        );

        expect(markedParts(container)).toEqual(['Self', 'Wire']);
    });

    it('renders the plain text when there are no usable terms', () => {
        const { container } = render(
            <HighlightedText
                text="Plain title"
                terms={['', '   ']}
            />
        );

        expect(container.querySelector('mark')).toBeNull();
        expect(container).toHaveTextContent('Plain title');
    });

    it('treats regex metacharacters in a term literally', () => {
        const { container } = render(
            <HighlightedText
                text="C++ and C# (notes)"
                terms={['c++', '(notes)']}
            />
        );

        expect(markedParts(container)).toEqual(['C++', '(notes)']);
    });

    it('never injects the text as HTML', () => {
        const { container } = render(
            <HighlightedText
                text="<img src=x onerror=alert(1)> script"
                terms={['script']}
            />
        );

        expect(container.querySelector('img')).toBeNull();
        expect(container).toHaveTextContent(
            '<img src=x onerror=alert(1)> script'
        );
        expect(markedParts(container)).toEqual(['script']);
    });
});
