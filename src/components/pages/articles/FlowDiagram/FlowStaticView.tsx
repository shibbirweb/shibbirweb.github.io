'use client';

import { useMemo, useState } from 'react';
import ExpandIcon from '@/components/icons/expand';
import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import { toMermaid } from '@/components/pages/articles/FlowDiagram/toMermaid';
import MermaidCopyButton from '@/components/pages/articles/MermaidRenderer/MermaidCopyButton';
import MermaidIconButton from '@/components/pages/articles/MermaidRenderer/MermaidIconButton';
import MermaidModal from '@/components/pages/articles/MermaidRenderer/MermaidModal';
import MermaidStage from '@/components/pages/articles/MermaidRenderer/MermaidStage';
import { useMermaidSvg } from '@/components/pages/articles/MermaidRenderer/hooks/useMermaidSvg';
import type {
    FlowDiagramDefinition,
    FlowScenario,
} from '@/components/pages/articles/FlowDiagram/types';

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
export default function FlowStaticView({
    definition,
    scenario,
}: {
    definition: FlowDiagramDefinition;
    scenario: FlowScenario;
}) {
    // Hand-written mermaid wins: it can say things the generator cannot, such as
    // a sequence diagram or grouped subgraphs. A scenario's own block beats the
    // diagram-level one, and generating from the DSL is the last resort, so a
    // diagram that never declares any mermaid still has a static view.
    const source = useMemo(
        () =>
            scenario.mermaid ??
            definition.mermaid ??
            toMermaid(definition, scenario),
        [definition, scenario]
    );
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
                <div className={styles.staticTools}>
                    <MermaidIconButton
                        aria-label="Full view"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <ExpandIcon className="size-4" />
                    </MermaidIconButton>
                    <MermaidCopyButton source={source} />
                </div>
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
