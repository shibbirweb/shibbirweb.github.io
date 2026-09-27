'use client';

import { useRef } from 'react';
import { cn } from '@/utils/cn';
import Shibbir from '@/components/icons/shibbir';
import ActivityReveal from '@/components/layout/Footer/SignatureSpotlight/ActivityReveal';
import { usePointerSpotlight } from '@/components/layout/Footer/SignatureSpotlight/hooks/usePointerSpotlight';
import styles from '@/components/layout/Footer/SignatureSpotlight/SignatureSpotlight.module.css';

/**
 * The footer signature: a dim solid wordmark overlaid with a graph of the
 * maintainer's real GitHub activity, shaped to the letters. The graph layer
 * (ActivityReveal) rests faintly everywhere and brightens within a soft circle
 * following the pointer; it is stacked over the solid base in one grid cell, so
 * the two stay aligned at any width.
 */
export default function SignatureSpotlight() {
    const spotlightRef = useRef<HTMLDivElement>(null);
    usePointerSpotlight(spotlightRef);

    return (
        // The signature keeps its exact box; nothing here is sized for the glow.
        // usePointerSpotlight measures the pointer's proximity to spotlightRef and
        // writes the spotlight position + opacity to it, which both layers inherit,
        // so the graph wakes as the cursor nears the letters from the top, left,
        // or right, without any layout change to the signature.
        <div
            ref={spotlightRef}
            className={cn(styles.spotlight, 'relative isolate grid w-full')}
        >
            <Shibbir
                aria-hidden
                className={cn(
                    styles.solid,
                    'text-neutral-300 [grid-area:1/1] dark:text-neutral-900'
                )}
            />
            <ActivityReveal spotlightRef={spotlightRef} />
        </div>
    );
}
