import { useEffect } from 'react';

/**
 * Warns via the browser's native prompt before the tab unloads (refresh, close,
 * navigate away) while the article has unsaved edits. In-app switches (New /
 * Open) are guarded separately with a confirm dialog.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
    useEffect(() => {
        if (!isDirty) return;
        function handleBeforeUnload(event: BeforeUnloadEvent) {
            event.preventDefault();
            event.returnValue = '';
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);
}
