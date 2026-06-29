import { useCallback, useEffect, useState } from 'react';

/**
 * Open/close state for the article search modal, plus the global keyboard
 * shortcut that summons it. Cmd+K (macOS) / Ctrl+K opens the modal from anywhere
 * on the page the trigger is mounted on.
 */
export function useSearchModal() {
    const [open, setOpen] = useState(false);
    const show = useCallback(() => setOpen(true), []);
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                setOpen(true);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return { open, show, close };
}
