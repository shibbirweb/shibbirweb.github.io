'use client';

import { useEffect, useState } from 'react';

export interface MermaidIsland {
    host: HTMLElement;
    source: string;
    key: string;
}

/**
 * Finds the `<pre class="mermaid">` blocks emitted from Markdown, hides each one
 * (keeping it as a no-JS fallback), and inserts an empty sibling element to host
 * an interactive React diagram. Returns the hosts plus their source; the
 * originals are restored on cleanup so a re-mount re-processes cleanly.
 */
export function useMermaidIslands(): MermaidIsland[] {
    const [islands, setIslands] = useState<MermaidIsland[]>([]);

    useEffect(() => {
        const blocks = Array.from(
            document.querySelectorAll<HTMLElement>('pre.mermaid')
        );
        if (blocks.length === 0) return;

        const created: { block: HTMLElement; host: HTMLElement }[] = [];
        const next = blocks.map((block, index) => {
            const source = block.textContent ?? '';
            const host = document.createElement('div');
            block.after(host);
            block.style.display = 'none';
            created.push({ block, host });
            return { host, source, key: `mermaid-island-${index}` };
        });
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
