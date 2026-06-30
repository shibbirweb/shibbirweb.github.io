'use client';

import { useEffect, useState } from 'react';

/**
 * False on the server and on the client's first (hydration) render, true after
 * mount. Use it to gate portals so the server and client agree on the first
 * render, avoiding a hydration mismatch.
 */
export function useMounted(): boolean {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted;
}
