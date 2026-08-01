'use client';

import { useId, type RefObject } from 'react';
import styles from '@/components/pages/articles/NetworkFlow/NetworkFlow.module.css';
import NetworkFlowArrowheads from '@/components/pages/articles/NetworkFlow/NetworkFlowArrowheads';
import NetworkFlowEdge from '@/components/pages/articles/NetworkFlow/NetworkFlowEdge';
import NetworkFlowNode from '@/components/pages/articles/NetworkFlow/NetworkFlowNode';
import NetworkFlowPacket from '@/components/pages/articles/NetworkFlow/NetworkFlowPacket';
import {
    VIEW_BOX_HEIGHT,
    VIEW_BOX_WIDTH,
    edgeTouchesNode,
    nodesById,
} from '@/components/pages/articles/NetworkFlow/geometry';
import type { NetworkFlowScenario } from '@/components/pages/articles/NetworkFlow/types';

interface NetworkFlowSceneProps {
    scenario: NetworkFlowScenario;
    svgRef: RefObject<SVGSVGElement | null>;
    selectedNodeId: string | null;
    onSelectNode: (nodeId: string) => void;
    isStepping: boolean;
    stepIndex: number;
    animatePackets: boolean;
    title: string;
}

/**
 * The SVG canvas: arrows, boxes, and the packets travelling between them.
 * Highlighting has one rule, applied here so the child components stay dumb: while
 * stepping, only the current hop is lit; with a node selected, only the hops that
 * touch it are; otherwise everything sits at full strength.
 */
export default function NetworkFlowScene({
    scenario,
    svgRef,
    selectedNodeId,
    onSelectNode,
    isStepping,
    stepIndex,
    animatePackets,
    title,
}: NetworkFlowSceneProps) {
    const reactId = useId();
    const markerPrefix = `netflow-arrow-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
    const nodeLookup = nodesById(scenario.nodes);
    const hasFocus = isStepping || selectedNodeId !== null;

    // Scenarios of one diagram share a single node list so the grid never shifts
    // when toggling, which means a scenario that routes down only one branch leaves
    // the other branch's boxes with no edges at all. Those are faded back rather
    // than dropped, so the reader can still see the road not taken (and click it),
    // and nothing jumps position.
    const routedNodeIds = new Set(
        scenario.edges.flatMap((edge) => [edge.from, edge.to])
    );

    const isEdgeActive = (edgeIndex: number) => {
        if (isStepping) return edgeIndex === stepIndex;
        if (selectedNodeId) {
            return edgeTouchesNode(scenario.edges[edgeIndex], selectedNodeId);
        }
        return false;
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
            role="img"
            aria-label={title}
            className={styles.canvas}
        >
            <NetworkFlowArrowheads markerPrefix={markerPrefix} />

            {scenario.edges.map((edge, edgeIndex) => {
                const from = nodeLookup.get(edge.from);
                const to = nodeLookup.get(edge.to);
                if (!from || !to) return null;
                const isActive = isEdgeActive(edgeIndex);
                return (
                    <NetworkFlowEdge
                        key={`${edge.from}-${edge.to}`}
                        edge={edge}
                        from={from}
                        to={to}
                        isActive={isActive}
                        isDimmed={hasFocus && !isActive}
                        markerPrefix={markerPrefix}
                    />
                );
            })}

            {scenario.edges.map((edge, edgeIndex) => {
                const from = nodeLookup.get(edge.from);
                const to = nodeLookup.get(edge.to);
                if (!from || !to) return null;
                // While stepping, only the current hop carries a packet. The key
                // includes the step so SMIL restarts the run on every press.
                if (isStepping) {
                    if (edgeIndex !== stepIndex) return null;
                    return (
                        <NetworkFlowPacket
                            key={`step-${stepIndex}-${scenario.id}`}
                            edge={edge}
                            from={from}
                            to={to}
                            index={0}
                            mode={animatePackets ? 'step' : 'static'}
                        />
                    );
                }
                if (!animatePackets) return null;
                return (
                    <NetworkFlowPacket
                        key={`loop-${edge.from}-${edge.to}`}
                        edge={edge}
                        from={from}
                        to={to}
                        index={edgeIndex}
                        mode="loop"
                    />
                );
            })}

            {scenario.nodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isOnActiveHop =
                    isStepping &&
                    edgeTouchesNode(scenario.edges[stepIndex], node.id);
                // Selecting a node always brings it forward, even one this
                // scenario does not route through, so it can still be read.
                const isDimmed =
                    !isSelected &&
                    (!routedNodeIds.has(node.id) ||
                        (hasFocus && !isOnActiveHop));
                return (
                    <NetworkFlowNode
                        key={node.id}
                        node={node}
                        isSelected={isSelected}
                        isDimmed={isDimmed}
                        onSelect={onSelectNode}
                    />
                );
            })}
        </svg>
    );
}
