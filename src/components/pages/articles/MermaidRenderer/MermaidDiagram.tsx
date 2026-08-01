'use client';

import { useState } from 'react';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import DiagramTools from '@/components/pages/articles/DiagramTools';
import styles from '@/components/pages/articles/MermaidRenderer/MermaidDiagram.module.css';
import MermaidStage from '@/components/pages/articles/MermaidRenderer/MermaidStage';
import MermaidModal from '@/components/pages/articles/MermaidRenderer/MermaidModal';
import { useMermaidSvg } from '@/components/pages/articles/MermaidRenderer/hooks/useMermaidSvg';
import { cn } from '@/utils/cn';

/**
 * One interactive Mermaid diagram. Inline it shows the pannable stage with copy
 * and full-view controls; the full-view button opens a modal popup over a
 * backdrop. Mermaid is rendered once and the SVG is shared with the modal.
 *
 * The frame carries the site's signature accent bloom and cursor spotlight, the
 * same surface a FlowDiagram gets, so a plain diagram and an interactive one read
 * as the same kind of thing. Neither light costs a listener here: the SpotlightGroup
 * around the article body already delegates one, and it resolves this frame through
 * the data attribute spotlightSurfaceProps adds.
 */
export default function MermaidDiagram({ source }: { source: string }) {
    const svg = useMermaidSvg(source);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!svg) {
        return <pre className={cn('not-prose', styles.fallback)}>{source}</pre>;
    }

    return (
        <>
            <div
                {...spotlightSurfaceProps}
                className={cn('not-prose', styles.frame)}
            >
                <div className={styles.stage}>
                    <MermaidStage
                        svg={svg}
                        enableWheel={false}
                        allowTouchPan={false}
                    />
                    <DiagramTools
                        source={source}
                        onOpenFullView={() => setIsModalOpen(true)}
                        className={styles.tools}
                    />
                </div>
                <SpotlightBorder className={styles.spotlightBorder} />
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
