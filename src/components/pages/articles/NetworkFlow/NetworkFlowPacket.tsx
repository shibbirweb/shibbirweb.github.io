'use client';

import styles from '@/components/pages/articles/NetworkFlow/NetworkFlow.module.css';
import {
    edgeMidpoint,
    edgePathData,
} from '@/components/pages/articles/NetworkFlow/geometry';
import type {
    NetworkFlowEdge,
    NetworkFlowNode,
} from '@/components/pages/articles/NetworkFlow/types';

/** One full trip along a hop, in seconds. */
const LOOP_DURATION = 2.6;
/** Gap between consecutive hops setting off, so packets read as a queue. */
const LOOP_STAGGER = 0.42;
/** A single stepped hop is quicker, since the reader asked for exactly one. */
const STEP_DURATION = 0.9;

interface NetworkFlowPacketProps {
    edge: NetworkFlowEdge;
    from: NetworkFlowNode;
    to: NetworkFlowNode;
    /** Position in the scenario, used to stagger the looping packets. */
    index: number;
    /** Looping travels forever; stepping runs once and freezes at the far end. */
    mode: 'loop' | 'step' | 'static';
}

/**
 * The dot that travels a hop. Movement uses SMIL `<animateMotion>` rather than a
 * CSS offset-path: it follows the very same path data the arrow is drawn from, and
 * the whole SVG's clock can be frozen in one call (see `useSmilPlayback`).
 * In `static` mode (reduced motion) the dot simply rests at the midpoint.
 */
export default function NetworkFlowPacket({
    edge,
    from,
    to,
    index,
    mode,
}: NetworkFlowPacketProps) {
    const tone = edge.tone ?? 'neutral';

    if (mode === 'static') {
        const midpoint = edgeMidpoint(from, to);
        return (
            <circle
                cx={midpoint.x}
                cy={midpoint.y}
                r={5}
                data-tone={tone}
                className={styles.packet}
            />
        );
    }

    const pathData = edgePathData(from, to);
    const beginSeconds = mode === 'loop' ? index * LOOP_STAGGER : 0;
    const begin = `${beginSeconds}s`;

    return (
        // A circle with no cx/cy sits at the SVG origin, and `animateMotion` only
        // takes over once its begin time arrives. Without the opacity gate below,
        // every staggered packet would be visible in the top-left corner until its
        // turn came, then jump onto its path. So each one starts hidden and is
        // switched on at exactly the moment it begins to move.
        <circle
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
            {mode === 'loop' ? (
                <animateMotion
                    dur={`${LOOP_DURATION}s`}
                    begin={begin}
                    repeatCount="indefinite"
                    path={pathData}
                />
            ) : (
                <animateMotion
                    dur={`${STEP_DURATION}s`}
                    begin={begin}
                    fill="freeze"
                    path={pathData}
                />
            )}
        </circle>
    );
}
