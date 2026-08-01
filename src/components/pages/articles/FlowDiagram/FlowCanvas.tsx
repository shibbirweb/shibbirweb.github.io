'use client';

import { useCallback, useRef } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/base.css';
import { cn } from '@/utils/cn';
import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import FlowNode, {
    type FlowDiagramNode,
} from '@/components/pages/articles/FlowDiagram/FlowNode';
import FlowPacketEdge, {
    type FlowDiagramEdge,
} from '@/components/pages/articles/FlowDiagram/FlowPacketEdge';
import FlowCanvasControls from '@/components/pages/articles/FlowDiagram/FlowCanvasControls';
import { FIT_VIEW_PADDING } from '@/components/pages/articles/FlowDiagram/layout';
import { useBlockTouchPan } from '@/components/pages/articles/FlowDiagram/hooks/useBlockTouchPan';
import { useFlowHighlight } from '@/components/pages/articles/FlowDiagram/hooks/useFlowHighlight';
import { useFlowNodeLayout } from '@/components/pages/articles/FlowDiagram/hooks/useFlowNodeLayout';
import {
    PAN_STEP,
    useDiagramViewportKeys,
} from '@/components/pages/articles/hooks/useDiagramViewportKeys';
import type {
    FlowDiagramDefinition,
    FlowScenario,
} from '@/components/pages/articles/FlowDiagram/types';

// Must be module-level constants: React Flow warns and re-renders every node if
// these objects are recreated on each render.
const nodeTypes = { flowNode: FlowNode };
const edgeTypes = { packet: FlowPacketEdge };

interface FlowCanvasProps {
    definition: FlowDiagramDefinition;
    scenario: FlowScenario;
    selectedNodeId: string | null;
    isStepping: boolean;
    stepIndex: number;
    animate: boolean;
    onSelectNode: (nodeId: string) => void;
    /** Zoom toward the cursor on wheel (used in the modal). */
    enableWheel: boolean;
    /** Allow drag-panning with touch/pen, not just mouse (used in the modal). */
    allowTouchPan: boolean;
}

function FlowCanvasInner({
    definition,
    scenario,
    selectedNodeId,
    isStepping,
    stepIndex,
    animate,
    onSelectNode,
    enableWheel,
    allowTouchPan,
}: FlowCanvasProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<FlowDiagramNode>([]);
    const [edges, setEdges] = useEdgesState<FlowDiagramEdge>([]);
    const { fitView, getViewport, setViewport, zoomIn, zoomOut } = useReactFlow<
        FlowDiagramNode,
        FlowDiagramEdge
    >();
    const viewportRef = useRef<HTMLDivElement>(null);

    useFlowNodeLayout(definition, setNodes);
    useFlowHighlight({
        definition,
        scenario,
        selectedNodeId,
        isStepping,
        stepIndex,
        animate,
        setNodes,
        setEdges,
    });
    useBlockTouchPan(viewportRef, !allowTouchPan);

    const panBy = useCallback(
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

    const resetView = useCallback(() => {
        void fitView({ padding: FIT_VIEW_PADDING, duration: 0 });
    }, [fitView]);

    const handleKeyDown = useDiagramViewportKeys({
        panBy,
        zoomIn: () => void zoomIn(),
        zoomOut: () => void zoomOut(),
        reset: resetView,
    });

    const handleNodeClick = useCallback<NodeMouseHandler<FlowDiagramNode>>(
        (_event, node) => onSelectNode(node.id),
        [onSelectNode]
    );

    return (
        // The tone tokens ride on the canvas itself, not just the frame, so the
        // full-view modal (portaled to document.body) still has them to read.
        <div
            ref={viewportRef}
            className={cn(styles.tones, styles.viewStage)}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                // An article diagram is read, not edited: the reader may move the
                // view around, never the boxes, whose positions dagre owns.
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                edgesFocusable={false}
                // Left mouse button drags the view, the same gesture the mermaid
                // stage answers to. Middle and right are left alone so autoscroll
                // and the context menu still behave normally.
                panOnDrag={[0]}
                panOnScroll={false}
                // The wheel scrolls the page inline and zooms in the modal, so a
                // reader scrolling past a diagram is never trapped by it.
                zoomOnScroll={enableWheel}
                zoomOnPinch={enableWheel}
                zoomOnDoubleClick={false}
                preventScrolling={enableWheel}
                proOptions={{ hideAttribution: false }}
                // Out of the bottom-right corner, which the control cluster now
                // occupies. The attribution stays, it just moves over.
                attributionPosition="bottom-left"
                fitView
                fitViewOptions={{ padding: FIT_VIEW_PADDING }}
                tabIndex={0}
                aria-label={`${
                    definition.title ?? 'Network flow diagram'
                }. Drag to pan; use the arrow keys to pan and + or - to zoom.`}
                onKeyDown={handleKeyDown}
                className={cn(
                    styles.canvas,
                    'focus-visible:ring-foreground/30 outline-none focus-visible:ring-2 focus-visible:ring-inset'
                )}
            />
            <FlowCanvasControls
                className={styles.canvasControls}
                step={PAN_STEP}
            />
        </div>
    );
}

/**
 * React Flow's hooks need its provider, so the canvas supplies its own. The two
 * components deliberately share this file: the wrapper exists only to satisfy that
 * requirement and has no meaning apart from the canvas it wraps.
 */
export default function FlowCanvas(props: FlowCanvasProps) {
    return (
        <ReactFlowProvider>
            <FlowCanvasInner {...props} />
        </ReactFlowProvider>
    );
}
