'use client';

import { useEffect, useState } from 'react';
import { findNetworkFlowDefinition } from '@/components/pages/articles/NetworkFlow/contents';
import type { NetworkFlowDefinition } from '@/components/pages/articles/NetworkFlow/types';

export interface NetworkFlowIsland {
    host: HTMLElement;
    definition: NetworkFlowDefinition;
    key: string;
}

/**
 * Finds the `<pre class="netflow">` blocks emitted from Markdown, hides each one
 * (keeping its caption as a no-JS fallback), and inserts an empty sibling to host
 * an interactive React diagram. Mirrors `useMermaidIslands`; the originals are
 * restored on cleanup so a re-mount re-processes cleanly.
 *
 * A block naming a diagram that does not exist is left completely alone, so its
 * plain-text caption stays on the page instead of being hidden with nothing put
 * in its place.
 */
export function useNetworkFlowIslands(): NetworkFlowIsland[] {
    const [islands, setIslands] = useState<NetworkFlowIsland[]>([]);

    useEffect(() => {
        const blocks = Array.from(
            document.querySelectorAll<HTMLElement>('pre.netflow')
        );
        if (blocks.length === 0) return;

        const created: { block: HTMLElement; host: HTMLElement }[] = [];
        const next: NetworkFlowIsland[] = [];

        blocks.forEach((block, index) => {
            const definition = findNetworkFlowDefinition(
                block.dataset.netflowId ?? ''
            );
            if (!definition) return;
            const host = document.createElement('div');
            block.after(host);
            block.style.display = 'none';
            created.push({ block, host });
            next.push({ host, definition, key: `netflow-island-${index}` });
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
