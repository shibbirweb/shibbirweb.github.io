'use client';

import { createPortal } from 'react-dom';
import NetworkFlowDiagram from '@/components/pages/articles/NetworkFlow/NetworkFlowDiagram';
import { useNetworkFlowIslands } from '@/components/pages/articles/NetworkFlow/hooks/useNetworkFlowIslands';

/**
 * Upgrades the static `<pre class="netflow">` blocks in the article body into
 * interactive animated diagrams. Each one is portaled into its in-place host;
 * this component renders nothing of its own.
 */
export default function NetworkFlow() {
    const islands = useNetworkFlowIslands();
    return (
        <>
            {islands.map(({ host, definition, key }) =>
                createPortal(
                    <NetworkFlowDiagram definition={definition} />,
                    host,
                    key
                )
            )}
        </>
    );
}
