'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DiagramModal from '@/components/pages/articles/DiagramModal';
import DiagramTools from '@/components/pages/articles/DiagramTools';
import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import type {
    FlowDiagramDefinition,
    FlowScenario,
} from '@/components/pages/articles/FlowDiagram/types';

// React Flow and dagre are a large dependency for a page that may have no diagram
// on it, so the canvas is split out and loaded on demand, mirroring how mermaid is
// dynamically imported. ssr:false because React Flow measures the DOM.
const FlowCanvas = dynamic(
    () => import('@/components/pages/articles/FlowDiagram/FlowCanvas'),
    { ssr: false }
);

interface FlowInteractiveViewProps {
    definition: FlowDiagramDefinition;
    scenario: FlowScenario;
    /** The diagram's mermaid, so full view and the static view copy the same text. */
    mermaidSource: string;
    selectedNodeId: string | null;
    isStepping: boolean;
    stepIndex: number;
    animate: boolean;
    onSelectNode: (nodeId: string) => void;
}

/**
 * The live rendering: React Flow, wearing the same stage furniture a mermaid block
 * has. Pan, zoom, reset, full view and copy sit exactly where they sit on a static
 * diagram, so switching views changes what the picture can do and not where its
 * controls are.
 *
 * Full view mounts a second canvas rather than moving this one, which keeps the
 * inline view from tearing down and re-fitting around the modal. It is handed the
 * same props, so the scenario, the step and the selected box carry straight over,
 * and clicking a node in the modal updates the caption behind it.
 */
export default function FlowInteractiveView({
    definition,
    scenario,
    mermaidSource,
    selectedNodeId,
    isStepping,
    stepIndex,
    animate,
    onSelectNode,
}: FlowInteractiveViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const canvasProps = {
        definition,
        scenario,
        selectedNodeId,
        isStepping,
        stepIndex,
        onSelectNode,
    };

    return (
        <>
            <div className={styles.interactiveStage}>
                <FlowCanvas
                    {...canvasProps}
                    // The modal's canvas carries the packets while it is open, so
                    // only one of the two is ever animating.
                    animate={animate && !isModalOpen}
                    enableWheel={false}
                    allowTouchPan={false}
                />
                <DiagramTools
                    source={mermaidSource}
                    onOpenFullView={() => setIsModalOpen(true)}
                    className={styles.staticTools}
                />
            </div>
            {isModalOpen && (
                <DiagramModal
                    source={mermaidSource}
                    label={`${definition.title ?? 'Diagram'}, full view`}
                    onClose={() => setIsModalOpen(false)}
                >
                    <FlowCanvas
                        {...canvasProps}
                        animate={animate}
                        enableWheel
                        allowTouchPan
                    />
                </DiagramModal>
            )}
        </>
    );
}
