import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Invokes `onClose` whenever the route (pathname) changes. */
export function useCloseOnRouteChange(onClose: () => void) {
    const pathname = usePathname();
    useEffect(() => {
        onClose();
    }, [pathname, onClose]);
}
