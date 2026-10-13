'use client';

import { RefObject, useRef } from 'react';
import { cn } from '@/utils/cn';
import { useActivityGraph } from '@/components/layout/Footer/SignatureSpotlight/hooks/useActivityGraph';
import styles from '@/components/layout/Footer/SignatureSpotlight/SignatureSpotlight.module.css';

/**
 * The signature's contribution-graph layer: the wordmark redrawn on a canvas
 * as squares showing the maintainer's last 30 days of GitHub activity. It rests
 * faintly across the whole name and rises to full strength inside the pointer
 * spotlight (whose position and opacity it inherits from `spotlightRef`).
 * useActivityGraph loads the data, draws the squares, and lets them breathe
 * gently while the spotlight is lit.
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
