'use client';

import styles from '@/components/pages/articles/NetworkFlow/NetworkFlow.module.css';

interface NetworkFlowCaptionProps {
    /** Short label for where the text came from, e.g. "Hop 2" or a node name. */
    source: string;
    text: string;
}

/**
 * The explanation strip under the canvas. It is an aria-live region so that
 * stepping a hop or selecting a node is announced, since for a screen reader the
 * change in the diagram itself is invisible.
 */
export default function NetworkFlowCaption({
    source,
    text,
}: NetworkFlowCaptionProps) {
    return (
        <p className={styles.caption} aria-live="polite">
            <span className={styles.captionSource}>{source}</span>
            <span>{text}</span>
        </p>
    );
}
