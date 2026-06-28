'use client';

import { createPortal } from 'react-dom';
import MermaidDiagram from '@/components/pages/articles/MermaidRenderer/MermaidDiagram';
import { useMermaidIslands } from '@/components/pages/articles/MermaidRenderer/hooks/useMermaidIslands';

/**
 * Upgrades the static `<pre class="mermaid">` blocks in the article body into
 * interactive pan / zoom / full-screen diagrams. Mermaid loads lazily, so pages
 * without a diagram ship no extra JS. Each diagram is portaled into its in-place
 * host; this component renders nothing of its own.
 */
export default function MermaidRenderer() {
    const islands = useMermaidIslands();
    return (
        <>
            {islands.map(({ host, source, key }) =>
                createPortal(<MermaidDiagram source={source} />, host, key)
            )}
        </>
    );
}
