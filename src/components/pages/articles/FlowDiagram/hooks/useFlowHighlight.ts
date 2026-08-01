'use client';

import { useEffect } from 'react';
import { MarkerType } from '@xyflow/react';
import { DIAGRAM_TONE_HEX } from '@/components/pages/articles/diagramTones';
import type { FlowDiagramNode } from '@/components/pages/articles/FlowDiagram/FlowNode';
import type {
    FlowDiagramEdge,
    PacketMotion,
} from '@/components/pages/articles/FlowDiagram/FlowPacketEdge';
import type {
    FlowDiagramDefinition,
    FlowScenario,
} from '@/components/pages/articles/FlowDiagram/types';

// Arrowheads are drawn by React Flow into shared <marker> defs, which cannot read
// the CSS custom properties scoped to the canvas, so they take the literal palette.
// Everything else in the diagram uses the vars.
const MARKER_COLOR = DIAGRAM_TONE_HEX;

interface PacketMotionInput {
    /** Whether the scenario on screen routes this hop at all. */
    inScenario: boolean;
    /** Whether packets move in this diagram, at the reader's or the author's word. */
    animate: boolean;
    isStepping: boolean;
    isActive: boolean;
}

/**
 * How a hop's packet should move. Four inputs collapse to three states, and the
 * order of these checks is the rule: a hop nobody routes never moves whatever else
 * is true, then the continuous loop is the resting behaviour, and only while
 * stepping does a hop have to be the current one to run.
 */
function resolvePacketMotion({
    inScenario,
    animate,
    isStepping,
    isActive,
}: PacketMotionInput): PacketMotion {
    if (!inScenario || !animate) return 'still';
    if (!isStepping) return 'loop';
    return isActive ? 'step' : 'still';
}

interface FlowHighlightOptions {
    definition: FlowDiagramDefinition;
    scenario: FlowScenario;
    selectedNodeId: string | null;
    isStepping: boolean;
    stepIndex: number;
    /** Whether packets travel the hops at all. */
    animate: boolean;
    setNodes: React.Dispatch<React.SetStateAction<FlowDiagramNode[]>>;
    setEdges: React.Dispatch<React.SetStateAction<FlowDiagramEdge[]>>;
}

/**
 * Writes the whole highlighting rule into node and edge data, so those components
 * stay dumb and simply render what they are told.
 *
 * The rule: while stepping only the current hop is lit; with a node selected only
 * the hops touching it are; a hop this scenario does not route is always faded, and
 * so is any node left with no hops at all. Selecting a node always brings it
 * forward, even one this scenario does not route through, so it can still be read.
 */
export function useFlowHighlight({
    definition,
    scenario,
    selectedNodeId,
    isStepping,
    stepIndex,
    animate,
    setNodes,
    setEdges,
}: FlowHighlightOptions): void {
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
                        motion: resolvePacketMotion({
                            inScenario,
                            animate,
                            isStepping,
                            isActive,
                        }),
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
}
