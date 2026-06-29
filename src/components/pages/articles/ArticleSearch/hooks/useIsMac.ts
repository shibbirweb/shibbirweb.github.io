import { useEffect, useState } from 'react';

/**
 * Whether the device is an Apple platform, resolved after mount so the shortcut
 * hint can show ⌘ on macOS/iOS and Ctrl elsewhere. Returns false during SSR and
 * the first client render to keep hydration stable, then corrects on mount.
 */
export function useIsMac(): boolean {
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        const platform = navigator.platform || navigator.userAgent || '';
        setIsMac(/Mac|iPhone|iPad|iPod/i.test(platform));
    }, []);

    return isMac;
}
