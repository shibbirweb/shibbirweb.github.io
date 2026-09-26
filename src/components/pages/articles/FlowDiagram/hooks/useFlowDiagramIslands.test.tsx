import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFlowDiagramIslands } from '@/components/pages/articles/FlowDiagram/hooks/useFlowDiagramIslands';

const VALID_SOURCE = [
    'title: Phone to Pi-hole',
    'scenario "Router-wide"',
    'Phone --> Pi-hole (DNS query)',
].join('\n');
// A prose line with nothing declared above it is a parse error.
const INVALID_SOURCE = '> prose with nothing to describe';

/** Blocks live in their own article so their siblings are only each other. */
function articleBody(): HTMLElement {
    let article = document.querySelector('article');
    if (!article) {
        article = document.createElement('article');
        document.body.appendChild(article);
    }
    return article;
}

function addFlowBlock(source: string): HTMLPreElement {
    const block = document.createElement('pre');
    block.className = 'reactflow';
    block.textContent = source;
    articleBody().appendChild(block);
    return block;
}

beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    document.querySelector('article')?.remove();
});

describe('useFlowDiagramIslands', () => {
    it('returns no islands when the page has no reactflow blocks', () => {
        const { result } = renderHook(() => useFlowDiagramIslands());

        expect(result.current).toEqual([]);
    });

    it('parses a block, hides it, and inserts a host after it', () => {
        const block = addFlowBlock(VALID_SOURCE);

        const { result } = renderHook(() => useFlowDiagramIslands());

        expect(result.current).toHaveLength(1);
        const [island] = result.current;
        expect(island.key).toBe('flow-island-0');
        expect(island.definition.title).toBe('Phone to Pi-hole');
        expect(block.style.display).toBe('none');
        expect(block.nextElementSibling).toBe(island.host);
    });

    it('skips a block that fails to parse and leaves it visible', () => {
        const broken = addFlowBlock(INVALID_SOURCE);
        const valid = addFlowBlock(VALID_SOURCE);

        const { result } = renderHook(() => useFlowDiagramIslands());

        expect(result.current).toHaveLength(1);
        expect(result.current[0].key).toBe('flow-island-1');
        expect(broken.style.display).toBe('');
        expect(broken.nextElementSibling).toBe(valid);
        expect(valid.style.display).toBe('none');
    });

    it('logs the parse error rather than swallowing it', () => {
        addFlowBlock(INVALID_SOURCE);

        renderHook(() => useFlowDiagramIslands());

        expect(console.error).toHaveBeenCalledWith(
            'Could not parse a reactflow diagram:',
            expect.any(Error)
        );
    });

    it('returns no islands when every block fails to parse', () => {
        const broken = addFlowBlock(INVALID_SOURCE);

        const { result } = renderHook(() => useFlowDiagramIslands());

        expect(result.current).toEqual([]);
        expect(broken.style.display).toBe('');
        expect(broken.nextElementSibling).toBeNull();
    });

    it('removes the hosts and shows the originals again on unmount', () => {
        const block = addFlowBlock(VALID_SOURCE);
        const { result, unmount } = renderHook(() => useFlowDiagramIslands());
        const host = result.current[0].host;

        unmount();

        expect(host.isConnected).toBe(false);
        expect(block.style.display).toBe('');
    });
});
