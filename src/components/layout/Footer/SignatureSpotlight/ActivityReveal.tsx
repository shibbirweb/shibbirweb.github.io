'use client';

import { RefObject, useRef } from 'react';
import { cn } from '@/utils/cn';
import { useActivityGraph } from '@/components/layout/Footer/SignatureSpotlight/hooks/useActivityGraph';
import styles from '@/components/layout/Footer/SignatureSpotlight/SignatureSpotlight.module.css';

/**
 * The signature's contribution-graph reveal layer: the wordmark redrawn as
 * GitHub-style activity squares on a canvas, shown only inside the pointer
 * spotlight (whose position and opacity it inherits from `spotlightRef`). Away
 * from the pointer the layer is invisible and the solid wordmark shows through;
 * near it the letters read as a graph of busy and quiet days. useActivityGraph
 * draws the squares and keeps them quietly shifting while the reveal is shown.
 */
export default function ActivityReveal({
    spotlightRef,
}: {
    spotlightRef: RefObject<HTMLDivElement | null>;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useActivityGraph(canvasRef, spotlightRef);

    return (
        <div
            aria-hidden
            className={cn(
                styles.reveal,
                'pointer-events-none relative [grid-area:1/1]'
            )}
        >
            <canvas
                ref={canvasRef}
                className={styles.activityCanvas}
            />
        </div>
    );
}
