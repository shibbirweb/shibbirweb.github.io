'use client';

import { useState } from 'react';
import { useServiceWorker } from '@/components/pwa/ServiceWorkerManager/hooks/useServiceWorker';
import UpdateToast from '@/components/pwa/UpdateToast';

/**
 * Registers the service worker and renders the update toast when a newer build
 * is ready. Rendered only in production (see layout.tsx). Thin by design: the
 * registration, update detection, and version polling live in useServiceWorker.
 */
export default function ServiceWorkerManager() {
    const { updateReady, applyUpdate } = useServiceWorker();
    const [dismissed, setDismissed] = useState(false);

    if (!updateReady || dismissed) return null;

    return (
        <UpdateToast
            onReload={applyUpdate}
            onDismiss={() => setDismissed(true)}
        />
    );
}
