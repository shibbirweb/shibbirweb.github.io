'use client';

import { useRef } from 'react';
import { cn } from '@/utils/cn';
import Shibbir from '@/components/icons/shibbir';
import { usePointerSpotlight } from '@/components/layout/Footer/SignatureSpotlight/hooks/usePointerSpotlight';
import styles from '@/components/layout/Footer/SignatureSpotlight/SignatureSpotlight.module.css';

/**
 * The footer signature whose glyphs change color only within a soft circle that
 * follows the pointer, fading back to the dim watermark away from it. A brighter
 * copy of the same SVG is masked to that circle and stacked over the dim base in
 * one grid cell, so the two stay perfectly aligned at any width.
 */
export default function SignatureSpotlight() {
    const containerRef = useRef<HTMLDivElement>(null);
    usePointerSpotlight(containerRef);

    return (
        <div
            ref={containerRef}
            className={cn(styles.spotlight, 'relative isolate grid w-full')}
        >
            <Shibbir
                aria-hidden
                className="text-neutral-300 [grid-area:1/1] dark:text-neutral-900"
            />
            <Shibbir
                aria-hidden
                className={cn(styles.reveal, 'pointer-events-none [grid-area:1/1]')}
            />
        </div>
    );
}
