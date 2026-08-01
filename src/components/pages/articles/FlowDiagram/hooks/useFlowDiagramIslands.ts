'use client';

import { useEffect, useState } from 'react';
import { parseFlowDiagram } from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';
import type { FlowDiagramDefinition } from '@/components/pages/articles/FlowDiagram/types';

export interface FlowDiagramIsland {
    host: HTMLElement;
    definition: FlowDiagramDefinition;
    key: string;
}

/**
 * Finds the `<pre class="reactflow">` blocks emitted from Markdown, parses each
 * one, hides it, and inserts an empty sibling to host an interactive diagram.
 * Mirrors `useMermaidIslands`; the originals are restored on cleanup so a re-mount
 * re-processes cleanly.
 *
 * A block whose source fails to parse is left completely alone, so its text stays
 * on the page as a readable fallback instead of being replaced by nothing. The
 * parse error is logged, since a broken diagram in an article is a bug worth
 * seeing rather than swallowing.
 */
export function useFlowDiagramIslands(): FlowDiagramIsland[] {
    const [islands, setIslands] = useState<FlowDiagramIsland[]>([]);

    useEffect(() => {
        const blocks = Array.from(
            document.querySelectorAll<HTMLElement>('pre.reactflow')
        );
        if (blocks.length === 0) return;

        const created: { block: HTMLElement; host: HTMLElement }[] = [];
        const next: FlowDiagramIsland[] = [];

        blocks.forEach((block, index) => {
            let definition: FlowDiagramDefinition;
            try {
                definition = parseFlowDiagram(block.textContent ?? '');
            } catch (error) {
                console.error('Could not parse a reactflow diagram:', error);
                return;
            }
            const host = document.createElement('div');
            block.after(host);
            block.style.display = 'none';
            created.push({ block, host });
            next.push({ host, definition, key: `flow-island-${index}` });
        });

        if (next.length === 0) return;
        setIslands(next);

        return () => {
            for (const { block, host } of created) {
                host.remove();
                block.style.display = '';
            }
            setIslands([]);
        };
    }, []);

    return islands;
}
