'use client';

import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import MermaidControls from '@/components/pages/articles/MermaidRenderer/MermaidControls';
import { FIT_VIEW_PADDING } from '@/components/pages/articles/FlowDiagram/layout';

/**
 * The same 3x3 pan / zoom / reset cluster a mermaid diagram carries, driving React
 * Flow's viewport instead of a CSS transform. Reusing the component rather than
 * rebuilding it is the point: the two renderings of a diagram should not have
 * differently shaped controls in different corners.
 *
 * Must be rendered inside the ReactFlowProvider, since useReactFlow reads it.
 */
export default function FlowCanvasControls({
    className,
    step,
}: {
    className?: string;
    /** Pixels to shift per press, matching the mermaid stage's arrow-key step. */
    step: number;
}) {
    const { getViewport, setViewport, zoomIn, zoomOut, fitView } =
        useReactFlow();

    // React Flow's viewport x/y translates the content, the same direction the
    // mermaid stage's transform moves in, so "pan up" means the same thing in both:
    // the content slides down and reveals what was above it.
    const handlePan = useCallback(
        (dx: number, dy: number) => {
            const viewport = getViewport();
            void setViewport({
                x: viewport.x + dx,
                y: viewport.y + dy,
                zoom: viewport.zoom,
            });
        },
        [getViewport, setViewport]
    );

    const handleReset = useCallback(() => {
        void fitView({ padding: FIT_VIEW_PADDING, duration: 0 });
    }, [fitView]);

    return (
        <MermaidControls
            className={className}
            step={step}
            onPan={handlePan}
            onReset={handleReset}
            onZoomIn={() => void zoomIn()}
            onZoomOut={() => void zoomOut()}
        />
    );
}
