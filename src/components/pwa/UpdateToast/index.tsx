'use client';

import { cn } from '@/utils/cn';
import styles from '@/components/pwa/UpdateToast/UpdateToast.module.css';

interface UpdateToastProps {
    /** Apply the pending update (reloads onto the new build). */
    onReload: () => void;
    /** Hide the toast without updating. */
    onDismiss: () => void;
}

/**
 * Non-blocking notification that a newer build is ready. A compact translucent
 * card anchored to the bottom-right corner (matching the site's surface motif:
 * blurred background, hairline border), so it stays out of the way of page
 * content instead of spanning the viewport.
 */
export default function UpdateToast({ onReload, onDismiss }: UpdateToastProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                styles.toast,
                'border-foreground/10 sticky bottom-4 z-50 mx-4 flex max-w-[calc(100%-2rem)] items-center gap-3 self-center rounded-xl sm:self-start border py-2.5 pr-2.5 pl-3.5 shadow-lg backdrop-blur-lg'
            )}
        >
            <span
                aria-hidden
                className="bg-foreground/40 size-1.5 shrink-0 rounded-full motion-safe:animate-pulse"
            />
            <p className="text-sm font-medium whitespace-nowrap">
                Update available
            </p>
            <button
                type="button"
                onClick={onReload}
                className="bg-foreground text-background hover:bg-foreground/90 ml-1 cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
            >
                Reload
            </button>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss"
                className="text-foreground/70 hover:bg-foreground/10 hover:text-foreground flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-lg leading-none transition-colors"
            >
                &times;
            </button>
        </div>
    );
}
