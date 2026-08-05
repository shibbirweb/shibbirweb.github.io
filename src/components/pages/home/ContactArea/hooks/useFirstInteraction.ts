'use client';

import { useCallback, useMemo, useState } from 'react';

/**
 * Latches true the first time the reader focuses or points at the subtree the
 * returned props are spread onto, and never goes back. `onFocusCapture` covers a
 * keyboard visitor tabbing in; `onPointerDownCapture` covers a click or tap
 * anywhere inside, including areas that are not focusable. Both use the capture
 * phase so a child stopping propagation cannot hide the interaction.
 *
 * `markInteracted` is returned as well so a caller can add narrower signals of its
 * own (hovering one particular control, say) without widening the whole subtree.
 *
 * Used to hold an expensive third-party dependency back until the reader shows
 * they actually want the thing it powers, so the latch must be one-way: once the
 * work has started, letting it flip back would tear down whatever it produced.
 */
export function useFirstInteraction() {
    const [hasInteracted, setHasInteracted] = useState(false);

    const markInteracted = useCallback(() => setHasInteracted(true), []);

    // Every later interaction fires these too, but setting the same value is a
    // no-op bail in React, so no extra guard is needed.
    const interactionProps = useMemo(
        () => ({
            onFocusCapture: markInteracted,
            onPointerDownCapture: markInteracted,
        }),
        [markInteracted]
    );

    return { hasInteracted, interactionProps, markInteracted };
}
