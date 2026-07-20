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
    const revealRef = useRef<SVGSVGElement>(null);
    usePointerSpotlight(revealRef);

    return (
        // The signature keeps its exact box; nothing here is sized for the glow.
        // usePointerSpotlight measures the pointer's proximity to revealRef (the
        // glyph layer) and drives the reveal's opacity + mask position from it,
        // so the spotlight wakes as the cursor nears the letters from the top,
        // left, or right, without any layout change to the signature.
        <div className={cn(styles.spotlight, 'relative isolate grid w-full')}>
            <Shibbir
                aria-hidden
                className="text-neutral-300 [grid-area:1/1] dark:text-neutral-900"
            />
            <Shibbir
                ref={revealRef}
                aria-hidden
                className={cn(styles.reveal, 'pointer-events-none [grid-area:1/1]')}
            />
        </div>
    );
}
