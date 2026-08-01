'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
    MarkerType,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesInitialized,
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
import { layoutFlow } from '@/components/pages/articles/FlowDiagram/layout';
import FlowCanvasControls from '@/components/pages/articles/FlowDiagram/FlowCanvasControls';
import { DIAGRAM_TONE_HEX } from '@/components/pages/articles/diagramTones';
import type {
    FlowDiagramDefinition,
    FlowScenario,
} from '@/components/pages/articles/FlowDiagram/types';

// Must be module-level constants: React Flow warns and re-renders every node if
// these objects are recreated on each render.
const nodeTypes = { flowNode: FlowNode };
const edgeTypes = { packet: FlowPacketEdge };

// Arrowheads are drawn by React Flow into shared <marker> defs, which cannot read
// the CSS custom properties scoped to this component, so they take the literal
// palette. Everything else in the canvas uses the vars.
const MARKER_COLOR = DIAGRAM_TONE_HEX;

/** Pixels an arrow key or a d-pad press shifts the view, matching MermaidStage. */
const PAN_STEP = 48;

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
    const {
        fitView,
        getNodes,
        getViewport,
        setViewport,
        zoomIn,
        zoomOut,
    } = useReactFlow<FlowDiagramNode, FlowDiagramEdge>();
    const nodesInitialized = useNodesInitialized();
    const hasMeasuredLayout = useRef(false);
    const viewportRef = useRef<HTMLDivElement>(null);

    // 1. Build the boxes once per diagram, positioned from estimated sizes so the
    //    first paint is close. Positions come from the union of every scenario's
    //    hops, so switching scenario never moves a node.
    useEffect(() => {
        const positions = layoutFlow(
            definition.nodes,
            definition.edges,
            new Map()
        );
        hasMeasuredLayout.current = false;
        setNodes(
            definition.nodes.map((node) => ({
                id: node.id,
                type: 'flowNode' as const,
                position: positions.get(node.id) ?? { x: 0, y: 0 },
                draggable: false,
                selectable: false,
                connectable: false,
                data: {
                    label: node.label,
                    detail: node.detail,
                    tone: node.tone,
                    isSelected: false,
                    isDimmed: false,
                    hasDescription: Boolean(node.description),
                },
            }))
        );
    }, [definition, setNodes]);

    // 2. HTML boxes size themselves from their content, so the estimate above is
    //    always a little wrong. Once React Flow has measured them, lay out again
    //    with the real dimensions and fit the view. Skipping this leaves nodes
    //    overlapping wherever a label ran longer than the estimate.
    useEffect(() => {
        if (!nodesInitialized || hasMeasuredLayout.current) return;
        const sizes = new Map<string, { width: number; height: number }>();
        for (const node of getNodes()) {
            const { width, height } = node.measured ?? {};
            if (width && height) sizes.set(node.id, { width, height });
        }
        if (sizes.size === 0) return;
        hasMeasuredLayout.current = true;
        const positions = layoutFlow(definition.nodes, definition.edges, sizes);
        setNodes((current) =>
            current.map((node) => ({
                ...node,
                position: positions.get(node.id) ?? node.position,
            }))
        );
        const frame = requestAnimationFrame(() => {
            void fitView({ padding: 0.18, duration: 0 });
        });
        return () => cancelAnimationFrame(frame);
    }, [nodesInitialized, definition, getNodes, setNodes, fitView]);

    // 3. Highlighting. One rule, applied here so the node and edge components stay
    //    dumb: while stepping only the current hop is lit; with a node selected
    //    only the hops touching it are; a hop this scenario does not route is
    //    always faded, and so is any node left with no hops at all.
    const activeHopId = scenario.edgeIds[stepIndex];
    const hasFocus = isStepping || selectedNodeId !== null;

    useEffect(() => {
        const routedEdges = definition.edges.filter((edge) =>
            scenario.edgeIds.includes(edge.id)
        );
        const routedNodeIds = new Set(
            routedEdges.flatMap((edge) => [edge.source, edge.target])
        );

        setEdges(
            definition.edges.map((edge) => {
                const inScenario = scenario.edgeIds.includes(edge.id);
                const hopIndex = scenario.edgeIds.indexOf(edge.id);
                const isActive = isStepping
                    ? edge.id === activeHopId
                    : Boolean(
                          selectedNodeId &&
                              (edge.source === selectedNodeId ||
                                  edge.target === selectedNodeId)
                      );
                const tone = edge.tone ?? 'neutral';
                return {
                    id: edge.id,
                    type: 'packet' as const,
                    source: edge.source,
                    target: edge.target,
                    selectable: false,
                    focusable: false,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 16,
                        height: 16,
                        color: MARKER_COLOR[tone],
                    },
                    data: {
                        tone,
                        label: edge.label,
                        isActive,
                        isDimmed: !inScenario || (hasFocus && !isActive),
                        hopIndex: hopIndex < 0 ? 0 : hopIndex,
                        motion: !inScenario || !animate
                            ? ('still' as const)
                            : isStepping
                              ? isActive
                                  ? ('step' as const)
                                  : ('still' as const)
                              : ('loop' as const),
                        stepToken: `${scenario.id}-${stepIndex}`,
                    },
                };
            })
        );

        setNodes((current) =>
            current.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isOnActiveHop =
                    isStepping &&
                    Boolean(
                        activeHopId &&
                            definition.edges.some(
                                (edge) =>
                                    edge.id === activeHopId &&
                                    (edge.source === node.id ||
                                        edge.target === node.id)
                            )
                    );
                return {
                    ...node,
                    data: {
                        ...node.data,
                        isSelected,
                        // Selecting a node always brings it forward, even one this
                        // scenario does not route through, so it can still be read.
                        isDimmed:
                            !isSelected &&
                            (!routedNodeIds.has(node.id) ||
                                (hasFocus && !isOnActiveHop)),
                    },
                };
            })
        );
    }, [
        definition,
        scenario,
        selectedNodeId,
        isStepping,
        stepIndex,
        activeHopId,
        hasFocus,
        animate,
        setEdges,
        setNodes,
    ]);

    const handleNodeClick = useCallback<NodeMouseHandler<FlowDiagramNode>>(
        (_event, node) => onSelectNode(node.id),
        [onSelectNode]
    );

    // React Flow can restrict panning to given mouse buttons, but its filter only
    // consults that list for `mousedown`; a `touchstart` still starts a pan. So the
    // inline canvas blocks the gesture before d3-zoom's listener on the pane ever
    // sees it, which is what leaves a thumb swipe scrolling the article instead of
    // dragging a diagram that fills most of the screen. The modal has no page
    // behind it to scroll, so there it takes the gesture.
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport || allowTouchPan) return;
        const swallowTouch = (event: TouchEvent) => event.stopPropagation();
        viewport.addEventListener('touchstart', swallowTouch, {
            capture: true,
        });
        return () =>
            viewport.removeEventListener('touchstart', swallowTouch, {
                capture: true,
            });
    }, [allowTouchPan]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const viewport = getViewport();
        const panTo = (dx: number, dy: number) =>
            void setViewport({
                x: viewport.x + dx,
                y: viewport.y + dy,
                zoom: viewport.zoom,
            });
        switch (event.key) {
            case 'ArrowUp':
                panTo(0, PAN_STEP);
                break;
            case 'ArrowDown':
                panTo(0, -PAN_STEP);
                break;
            case 'ArrowLeft':
                panTo(PAN_STEP, 0);
                break;
            case 'ArrowRight':
                panTo(-PAN_STEP, 0);
                break;
            case '+':
            case '=':
                void zoomIn();
                break;
            case '-':
            case '_':
                void zoomOut();
                break;
            case '0':
                void fitView({ padding: 0.18, duration: 0 });
                break;
            default:
                return;
        }
        event.preventDefault();
    };

    return (
        // The tone tokens ride on the canvas itself, not just the frame, so the
        // full-view modal (portaled to document.body) still has them to read.
        <div
            ref={viewportRef}
            className={cn(styles.tones, styles.canvasViewport)}
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
                fitViewOptions={{ padding: 0.18 }}
                tabIndex={0}
                aria-label={`${
                    definition.title ?? 'Network flow diagram'
                }. Drag to pan; use the arrow keys to pan and + or - to zoom.`}
                onKeyDown={handleKeyDown}
                className={styles.canvas}
            />
            <FlowCanvasControls
                className={styles.canvasControls}
                step={PAN_STEP}
            />
        </div>
    );
}

/** React Flow's hooks need its provider, so the canvas supplies its own. */
export default function FlowCanvas(props: FlowCanvasProps) {
    return (
        <ReactFlowProvider>
            <FlowCanvasInner {...props} />
        </ReactFlowProvider>
    );
}
