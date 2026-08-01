'use client';

import { useEffect, useRef } from 'react';
import { useNodesInitialized, useReactFlow } from '@xyflow/react';
import {
    FIT_VIEW_PADDING,
    layoutFlow,
} from '@/components/pages/articles/FlowDiagram/layout';
import type { FlowDiagramNode } from '@/components/pages/articles/FlowDiagram/FlowNode';
import type { FlowDiagramEdge } from '@/components/pages/articles/FlowDiagram/FlowPacketEdge';
import type { FlowDiagramDefinition } from '@/components/pages/articles/FlowDiagram/types';

type SetNodes = React.Dispatch<React.SetStateAction<FlowDiagramNode[]>>;

/**
 * Positions the boxes, in two passes.
 *
 * The first builds them from estimated sizes so the first paint is close. Positions
 * come from the union of every scenario's hops, so switching scenario never moves a
 * node. But HTML boxes size themselves from their content, so the estimate is
 * always a little wrong, and the second pass lays out again with the dimensions
 * React Flow measured and refits the view. Skipping that leaves nodes overlapping
 * wherever a label ran longer than the estimate.
 *
 * The two are one concern and stay together: they share the ref that records
 * whether the measured pass has run, which is what stops it looping on the state
 * update it causes itself.
 *
 * Must be called inside the ReactFlowProvider.
 */
export function useFlowNodeLayout(
    definition: FlowDiagramDefinition,
    setNodes: SetNodes
): void {
    const { fitView, getNodes } = useReactFlow<
        FlowDiagramNode,
        FlowDiagramEdge
    >();
    const nodesInitialized = useNodesInitialized();
    const hasMeasuredLayout = useRef(false);

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
            void fitView({ padding: FIT_VIEW_PADDING, duration: 0 });
        });
        return () => cancelAnimationFrame(frame);
    }, [nodesInitialized, definition, getNodes, setNodes, fitView]);
}
