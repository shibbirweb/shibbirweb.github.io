'use client';

import { useEffect } from 'react';
import MermaidControls from '@/components/pages/articles/MermaidRenderer/MermaidControls';
import { usePanZoom } from '@/components/pages/articles/MermaidRenderer/hooks/usePanZoom';
import {
    PAN_STEP,
    useDiagramViewportKeys,
} from '@/components/pages/articles/hooks/useDiagramViewportKeys';

interface MermaidStageProps {
    svg: string;
    /** Zoom toward the cursor on wheel (used in the modal). */
    enableWheel: boolean;
    /** Allow drag-panning with touch/pen, not just mouse (used in the modal). */
    allowTouchPan: boolean;
}

/**
 * The pannable / zoomable diagram surface plus its control cluster. Fills its
 * parent, so the parent sets the size (a fixed height inline, the full panel in
 * the modal). The viewport is focusable: arrow keys pan, +/-/0 zoom and reset.
 */
export default function MermaidStage({
    svg,
    enableWheel,
    allowTouchPan,
}: MermaidStageProps) {
    const {
        viewportRef,
        contentRef,
        transform,
        fit,
        reset,
        zoomIn,
        zoomOut,
        panBy,
        onPointerDown,
        onPointerMove,
        onPointerUp,
    } = usePanZoom({ enableWheel, allowTouchPan });

    useEffect(() => {
        const frame = requestAnimationFrame(fit);
        return () => cancelAnimationFrame(frame);
    }, [svg, fit]);

    const handleKeyDown = useDiagramViewportKeys({
        panBy,
        zoomIn,
        zoomOut,
        reset,
    });

    return (
        <div className="relative h-full w-full">
            <div
                ref={viewportRef}
                tabIndex={0}
                aria-label="Mermaid diagram. Drag to pan; use the arrow keys to pan and + or - to zoom."
                className="focus-visible:ring-foreground/30 relative h-full w-full cursor-grab overflow-hidden outline-none select-none focus-visible:ring-2 focus-visible:ring-inset active:cursor-grabbing"
                style={{ touchAction: allowTouchPan ? 'none' : 'auto' }}
                onKeyDown={handleKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                <div
                    ref={contentRef}
                    className="origin-top-left will-change-transform [&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full"
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            </div>
            <MermaidControls
                className="absolute right-3 bottom-3 z-10"
                onPan={panBy}
                onReset={reset}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                step={PAN_STEP}
            />
        </div>
    );
}
