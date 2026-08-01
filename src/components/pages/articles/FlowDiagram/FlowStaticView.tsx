'use client';

import { useState } from 'react';
import DiagramTools from '@/components/pages/articles/DiagramTools';
import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import MermaidModal from '@/components/pages/articles/MermaidRenderer/MermaidModal';
import MermaidStage from '@/components/pages/articles/MermaidRenderer/MermaidStage';
import { useMermaidSvg } from '@/components/pages/articles/MermaidRenderer/hooks/useMermaidSvg';

/**
 * The static rendering: the same diagram drawn by mermaid instead of React Flow.
 *
 * Deliberately assembled from the very components a plain ```mermaid block uses,
 * so a diagram here pans, zooms, opens full screen and copies its source exactly
 * like every other mermaid diagram on the site. Only the outer bordered box is
 * left off, because the surrounding FlowDiagram frame already provides one.
 *
 * `useMermaidSvg` brings lazy loading and theme-aware re-rendering with it, and
 * falls back to the source in a `<pre>` when mermaid cannot parse the block.
 */
export default function FlowStaticView({ source }: { source: string }) {
    const svg = useMermaidSvg(source);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!svg) {
        return <pre className={styles.staticFallback}>{source}</pre>;
    }

    return (
        <>
            <div className={styles.staticStage}>
                <MermaidStage
                    svg={svg}
                    enableWheel={false}
                    allowTouchPan={false}
                />
                <DiagramTools
                    source={source}
                    onOpenFullView={() => setIsModalOpen(true)}
                    className={styles.staticTools}
                />
            </div>
            {isModalOpen && (
                <MermaidModal
                    svg={svg}
                    source={source}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}
