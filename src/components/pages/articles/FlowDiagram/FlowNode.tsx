'use client';

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import type { FlowTone } from '@/components/pages/articles/FlowDiagram/types';

export interface FlowNodeData extends Record<string, unknown> {
    label: string;
    detail?: string;
    tone?: FlowTone;
    isSelected: boolean;
    isDimmed: boolean;
    hasDescription: boolean;
}

export type FlowDiagramNode = Node<FlowNodeData, 'flowNode'>;

/**
 * One box. Plain HTML rather than SVG shapes, which is the main practical win of
 * moving to React Flow: the text wraps and the box sizes itself, so there are no
 * character limits to police and no labels being clipped by the next node.
 *
 * The handles are the anchor points React Flow routes edges between. They are
 * rendered invisible (see the module) because nothing here is user-connectable.
 */
export default function FlowNode({ data }: NodeProps<FlowDiagramNode>) {
    const { label, detail, tone, isSelected, isDimmed, hasDescription } = data;

    return (
        <div
            data-tone={tone ?? 'neutral'}
            data-selected={isSelected || undefined}
            data-dimmed={isDimmed || undefined}
            data-clickable={hasDescription || undefined}
            className={styles.node}
        >
            <Handle
                type="target"
                position={Position.Left}
                className={styles.handle}
                isConnectable={false}
            />
            <span className={styles.nodeLabel}>{label}</span>
            {detail && <span className={styles.nodeDetail}>{detail}</span>}
            <Handle
                type="source"
                position={Position.Right}
                className={styles.handle}
                isConnectable={false}
            />
        </div>
    );
}
