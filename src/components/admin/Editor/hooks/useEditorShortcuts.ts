'use client';

import { useEffect } from 'react';

/**
 * Document-level editor shortcuts: Ctrl/Cmd + S saves, Ctrl/Cmd + Shift + P
 * publishes, Ctrl/Cmd + / toggles the preview. Inline formatting shortcuts
 * (bold, italic, link) live on the editing surface, so they only fire while
 * editing.
 */
export function useEditorShortcuts({
    onSave,
    onPublish,
    onTogglePreview,
}: {
    onSave: () => void;
    onPublish: () => void;
    onTogglePreview: () => void;
}) {
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (!event.metaKey && !event.ctrlKey) return;
            const key = event.key.toLowerCase();
            if (key === 's') {
                event.preventDefault();
                onSave();
            } else if (key === 'p' && event.shiftKey) {
                event.preventDefault();
                onPublish();
            } else if (key === '/') {
                event.preventDefault();
                onTogglePreview();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onSave, onPublish, onTogglePreview]);
}
