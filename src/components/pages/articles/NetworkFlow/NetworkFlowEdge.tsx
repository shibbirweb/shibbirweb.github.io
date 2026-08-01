'use client';

import styles from '@/components/pages/articles/NetworkFlow/NetworkFlow.module.css';
import {
    edgeMidpoint,
    edgePathData,
} from '@/components/pages/articles/NetworkFlow/geometry';
import type {
    NetworkFlowEdge as NetworkFlowEdgeData,
    NetworkFlowNode,
} from '@/components/pages/articles/NetworkFlow/types';

interface NetworkFlowEdgeProps {
    edge: NetworkFlowEdgeData;
    from: NetworkFlowNode;
    to: NetworkFlowNode;
    isActive: boolean;
    isDimmed: boolean;
    /** Id prefix for the arrowhead markers defined once per diagram. */
    markerPrefix: string;
}

/**
 * One arrow between two nodes, plus its optional label. The label is drawn with a
 * background-coloured stroke underneath the glyphs (see `edgeLabel` in the module),
 * so it stays readable where it crosses the line.
 */
export default function NetworkFlowEdge({
    edge,
    from,
    to,
    isActive,
    isDimmed,
    markerPrefix,
}: NetworkFlowEdgeProps) {
    const tone = edge.tone ?? 'neutral';
    const midpoint = edgeMidpoint(from, to);

    return (
        <g
            data-tone={tone}
            data-active={isActive || undefined}
            data-dimmed={isDimmed || undefined}
            className={styles.edge}
        >
            <path
                d={edgePathData(from, to)}
                className={styles.edgeLine}
                markerEnd={`url(#${markerPrefix}-${tone})`}
            />
            {edge.label && (
                <text
                    x={midpoint.x}
                    y={midpoint.y - 9}
                    className={styles.edgeLabel}
                >
                    {edge.label}
                </text>
            )}
        </g>
    );
}
