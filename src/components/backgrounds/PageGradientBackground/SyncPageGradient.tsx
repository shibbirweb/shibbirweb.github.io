'use client';

import { useEffect } from 'react';
import { usePageGradientOverride } from '@/components/backgrounds/PageGradientBackground/PageGradientProvider';

/**
 * Claims the global page wash for the current page's colours while mounted, and
 * releases it on unmount so other routes fall back to their route-derived wash.
 * Rendered by pages that want the full-page gradient to match their own accent
 * (e.g. an article feeding its exact cover colours). Renders nothing.
 */
export default function SyncPageGradient({
    colors,
}: {
    colors: readonly [string, string];
}) {
    const { setOverride } = usePageGradientOverride();
    const [from, to] = colors;

    useEffect(() => {
        setOverride([from, to]);
        return () => setOverride(null);
    }, [from, to, setOverride]);

    return null;
}
