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
 * Non-blocking notification that a newer build is ready. Inverts the theme
 * colours (background/foreground flip with the theme) so it reads as a distinct
 * surface in both light and dark, and sits above the footer without covering
 * page content.
 */
export default function UpdateToast({ onReload, onDismiss }: UpdateToastProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                styles.toast,
                'bg-foreground text-background fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-full px-4 py-3 shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2'
            )}
        >
            <span
                aria-hidden
                className="bg-background/60 size-2 shrink-0 animate-pulse rounded-full"
            />
            <p className="text-sm font-medium">New version available</p>
            <button
                type="button"
                onClick={onReload}
                className="bg-background text-foreground ml-1 rounded-full px-3 py-1 text-sm font-semibold transition-transform duration-200 hover:scale-105"
            >
                Reload
            </button>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss"
                className="text-background/70 hover:text-background text-lg leading-none transition-colors"
            >
                &times;
            </button>
        </div>
    );
}
