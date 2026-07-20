'use client';

import { useState } from 'react';
import ExpandIcon from '@/components/icons/expand';
import MermaidIconButton from '@/components/pages/articles/MermaidRenderer/MermaidIconButton';
import MermaidCopyButton from '@/components/pages/articles/MermaidRenderer/MermaidCopyButton';
import MermaidStage from '@/components/pages/articles/MermaidRenderer/MermaidStage';
import MermaidModal from '@/components/pages/articles/MermaidRenderer/MermaidModal';
import { useMermaidSvg } from '@/components/pages/articles/MermaidRenderer/hooks/useMermaidSvg';

/**
 * One interactive Mermaid diagram. Inline it shows the pannable stage with copy
 * and full-view controls; the full-view button opens a modal popup over a
 * backdrop. Mermaid is rendered once and the SVG is shared with the modal.
 */
export default function MermaidDiagram({ source }: { source: string }) {
    const svg = useMermaidSvg(source);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!svg) {
        return (
            <pre className="not-prose border-foreground/10 text-foreground/70 overflow-x-auto rounded-xl border p-4 text-sm">
                {source}
            </pre>
        );
    }

    return (
        <>
            <div className="not-prose bg-background border-foreground/10 relative my-6 h-[28rem] overflow-hidden rounded-xl border">
                <MermaidStage
                    svg={svg}
                    enableWheel={false}
                    allowTouchPan={false}
                />
                <div className="absolute top-3 right-3 z-10 flex gap-1">
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
