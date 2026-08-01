'use client';

import { createPortal } from 'react-dom';
import FlowDiagram from '@/components/pages/articles/FlowDiagram/FlowDiagram';
import { useFlowDiagramIslands } from '@/components/pages/articles/FlowDiagram/hooks/useFlowDiagramIslands';

/**
 * Upgrades the static `<pre class="reactflow">` blocks in the article body into
 * interactive animated diagrams. Each one is portaled into its in-place host; this
 * component renders nothing of its own.
 */
export default function FlowDiagrams() {
    const islands = useFlowDiagramIslands();
    return (
        <>
            {islands.map(({ host, definition, key }) =>
                createPortal(<FlowDiagram definition={definition} />, host, key)
            )}
        </>
    );
}
