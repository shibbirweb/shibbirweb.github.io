'use client';

import styles from '@/components/pages/articles/NetworkFlow/NetworkFlow.module.css';
import {
    NODE_HEIGHT,
    NODE_WIDTH,
    nodeOrigin,
} from '@/components/pages/articles/NetworkFlow/geometry';
import type { NetworkFlowNode as NetworkFlowNodeData } from '@/components/pages/articles/NetworkFlow/types';

interface NetworkFlowNodeProps {
    node: NetworkFlowNodeData;
    isSelected: boolean;
    isDimmed: boolean;
    onSelect: (nodeId: string) => void;
}

/**
 * One box in the diagram, drawn with native SVG shapes rather than a
 * `foreignObject`, so it renders identically everywhere and needs no HTML
 * layout inside the canvas. The group carries button semantics and handles
 * Enter/Space itself, since an SVG `<g>` gets no keyboard behaviour for free.
 */
export default function NetworkFlowNode({
    node,
    isSelected,
    isDimmed,
    onSelect,
}: NetworkFlowNodeProps) {
    const { x, y } = nodeOrigin(node);
    const centerX = x + NODE_WIDTH / 2;
    const hasDetail = Boolean(node.detail);
    // With a second line the pair straddles the middle; alone, the label centres.
    const labelY = hasDetail ? y + NODE_HEIGHT / 2 - 3 : y + NODE_HEIGHT / 2 + 5;

    return (
        <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelect(node.id)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(node.id);
                }
            }}
            data-tone={node.tone ?? 'neutral'}
            data-selected={isSelected || undefined}
            data-dimmed={isDimmed || undefined}
            className={styles.node}
        >
            <title>{`${node.label}. ${node.description}`}</title>
            <rect
                x={x}
                y={y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={12}
                className={styles.nodeBox}
            />
            <text x={centerX} y={labelY} className={styles.nodeLabel}>
                {node.label}
            </text>
            {hasDetail && (
                <text
                    x={centerX}
                    y={y + NODE_HEIGHT / 2 + 16}
                    className={styles.nodeDetail}
                >
                    {node.detail}
                </text>
            )}
        </g>
    );
}
