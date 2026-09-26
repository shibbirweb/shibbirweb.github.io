import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useMermaidIslands } from '@/components/pages/articles/MermaidRenderer/hooks/useMermaidIslands';

/** Blocks live in their own article so their siblings are only each other. */
function articleBody(): HTMLElement {
    let article = document.querySelector('article');
    if (!article) {
        article = document.createElement('article');
        document.body.appendChild(article);
    }
    return article;
}

function addMermaidBlock(source: string): HTMLPreElement {
    const block = document.createElement('pre');
    block.className = 'mermaid';
    block.textContent = source;
    articleBody().appendChild(block);
    return block;
}

afterEach(() => {
    document.querySelector('article')?.remove();
});

describe('useMermaidIslands', () => {
    it('returns no islands when the page has no mermaid blocks', () => {
        const { result } = renderHook(() => useMermaidIslands());

        expect(result.current).toEqual([]);
    });

    it('hides each pre.mermaid and inserts a host right after it', () => {
        const first = addMermaidBlock('graph TD; A-->B');
        const second = addMermaidBlock('graph LR; C-->D');

        const { result } = renderHook(() => useMermaidIslands());

        expect(result.current).toHaveLength(2);
        expect(first.style.display).toBe('none');
        expect(second.style.display).toBe('none');
        expect(first.nextElementSibling).toBe(result.current[0].host);
        expect(second.nextElementSibling).toBe(result.current[1].host);
    });

    it('carries each block source and a stable key', () => {
        addMermaidBlock('graph TD; A-->B');
        addMermaidBlock('graph LR; C-->D');

        const { result } = renderHook(() => useMermaidIslands());

        expect(
            result.current.map(({ source, key }) => ({ source, key }))
        ).toEqual([
            { source: 'graph TD; A-->B', key: 'mermaid-island-0' },
            { source: 'graph LR; C-->D', key: 'mermaid-island-1' },
        ]);
    });

    it('ignores pre blocks without the mermaid class', () => {
        const plain = document.createElement('pre');
        plain.textContent = 'const answer = 42;';
        articleBody().appendChild(plain);

        const { result } = renderHook(() => useMermaidIslands());

        expect(result.current).toEqual([]);
        expect(plain.style.display).toBe('');
    });

    it('removes the hosts and shows the originals again on unmount', () => {
        const block = addMermaidBlock('graph TD; A-->B');
        const { result, unmount } = renderHook(() => useMermaidIslands());
        const host = result.current[0].host;

        unmount();

        expect(host.isConnected).toBe(false);
        expect(block.style.display).toBe('');
        expect(block.nextElementSibling).toBeNull();
    });

    it('re-processes cleanly on a second mount', () => {
        addMermaidBlock('graph TD; A-->B');
        renderHook(() => useMermaidIslands()).unmount();

        const { result } = renderHook(() => useMermaidIslands());

        expect(result.current).toHaveLength(1);
        expect(document.querySelectorAll('pre.mermaid + div')).toHaveLength(1);
    });
});
