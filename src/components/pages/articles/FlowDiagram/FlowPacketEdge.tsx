'use client';

import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    type Edge,
    type EdgeProps,
} from '@xyflow/react';
import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';
import type { FlowTone } from '@/components/pages/articles/FlowDiagram/types';

/** One full trip along a hop, in seconds. */
const LOOP_DURATION = 2.6;
/** Gap between consecutive hops setting off, so packets read as a queue. */
const LOOP_STAGGER = 0.42;
/** A single stepped hop is quicker, since the reader asked for exactly one. */
const STEP_DURATION = 0.9;

export interface FlowEdgeData extends Record<string, unknown> {
    tone?: FlowTone;
    label?: string;
    isActive: boolean;
    isDimmed: boolean;
    /** Position in the scenario, used to stagger the looping packets. */
    hopIndex: number;
    /** 'loop' rides forever, 'step' runs once, 'still' does not move at all. */
    motion: 'loop' | 'step' | 'still';
    /** Restarts the single-run animation when the reader steps again. */
    stepToken: string;
}

export type FlowDiagramEdge = Edge<FlowEdgeData, 'packet'>;

/**
 * One arrow, plus the dot travelling it. React Flow's built-in `animated` edge is
 * a dashed marching-ants stroke; a moving packet needs a custom edge, which the
 * React Flow docs solve the same way this does, with `<animateMotion>` following
 * the very path the arrow is drawn from.
 *
 * The label rides `EdgeLabelRenderer` (an HTML overlay) rather than SVG text, so
 * it wraps and never gets painted over by the node it runs into. That was a real
 * bug in the previous SVG-only engine.
 */
export default function FlowPacketEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    data,
}: EdgeProps<FlowDiagramEdge>) {
    const [path, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 18,
    });

    const tone = data?.tone ?? 'neutral';
    const motion = data?.motion ?? 'still';
    const hopIndex = data?.hopIndex ?? 0;
    const begin = `${motion === 'loop' ? hopIndex * LOOP_STAGGER : 0}s`;

    return (
        <g
            data-tone={tone}
            data-active={data?.isActive || undefined}
            data-dimmed={data?.isDimmed || undefined}
            className={styles.edge}
        >
            <BaseEdge id={id} path={path} markerEnd={markerEnd} />
            {motion !== 'still' && (
                // A circle with no cx/cy sits at the origin, and animateMotion only
                // takes over at its begin time. Without the opacity gate a staggered
                // packet would be visible in the corner until its turn came, then
                // jump onto its path.
                <circle
                    key={motion === 'step' ? data?.stepToken : undefined}
                    r={5}
                    opacity={0}
                    data-tone={tone}
                    className={styles.packet}
                >
                    <set
                        attributeName="opacity"
                        to="1"
                        begin={begin}
                        fill="freeze"
                    />
                    {motion === 'loop' ? (
                        <animateMotion
                            dur={`${LOOP_DURATION}s`}
                            begin={begin}
                            repeatCount="indefinite"
                            path={path}
                        />
                    ) : (
                        <animateMotion
                            dur={`${STEP_DURATION}s`}
                            begin={begin}
                            fill="freeze"
                            path={path}
                        />
                    )}
                </circle>
            )}
            {data?.label && (
                <EdgeLabelRenderer>
                    <div
                        data-tone={tone}
                        data-dimmed={data?.isDimmed || undefined}
                        className={styles.edgeLabel}
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        }}
                    >
                        {data.label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </g>
    );
}
