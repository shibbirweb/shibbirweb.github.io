'use client';

import DiagramModal from '@/components/pages/articles/DiagramModal';
import MermaidStage from '@/components/pages/articles/MermaidRenderer/MermaidStage';

interface MermaidModalProps {
    svg: string;
    source: string;
    onClose: () => void;
}

/**
 * A rendered mermaid diagram at full size. The wheel zooms and touch pans here,
 * both of which the inline stage gives up so the page keeps scrolling over it;
 * in a modal there is no page to scroll, so the diagram takes the gestures back.
 */
export default function MermaidModal({
    svg,
    source,
    onClose,
}: MermaidModalProps) {
    return (
        <DiagramModal
            source={source}
            label="Diagram, full view"
            onClose={onClose}
        >
            <MermaidStage svg={svg} enableWheel allowTouchPan />
        </DiagramModal>
    );
}
