'use client';

import styles from '@/components/pages/articles/FlowDiagram/FlowDiagram.module.css';

interface FlowCaptionProps {
    /** Short label for where the text came from, e.g. "Step 2" or a node name. */
    source: string;
    text: string;
}

/**
 * The explanation strip under the canvas. An aria-live region, so stepping a hop
 * or selecting a node is announced: for a screen reader the change in the diagram
 * itself is invisible.
 */
export default function FlowCaption({ source, text }: FlowCaptionProps) {
    return (
        <p
            className={styles.caption}
            aria-live="polite"
        >
            <span className={styles.captionSource}>{source}</span>
            <span>{text}</span>
        </p>
    );
}
