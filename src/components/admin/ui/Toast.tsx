'use client';

import { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/admin/ui/Icon';
import {
    useToastQueue,
    type ToastTone,
} from '@/components/admin/ui/hooks/useToastQueue';
import { useMounted } from '@/components/admin/ui/hooks/useMounted';
import { cn } from '@/utils/cn';

const ToastContext = createContext<
    ((message: string, tone?: ToastTone) => void) | null
>(null);

/** Fire a transient toast; returns a stable `notify(message, tone)` callback. */
export function useToast() {
    const notify = useContext(ToastContext);
    if (!notify) throw new Error('useToast must be used within ToastProvider');
    return notify;
}

const TONE_STYLES: Record<ToastTone, string> = {
    success: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
    error: 'border-red-500/40 text-red-700 dark:text-red-300',
    info: 'border-foreground/25 text-foreground',
};
const TONE_ICONS = { success: 'check', error: 'close', info: 'info' } as const;

export default function ToastProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { toasts, notify } = useToastQueue();
    const mounted = useMounted();

    return (
        <ToastContext.Provider value={notify}>
            {children}
            {mounted &&
                createPortal(
                    <div
                        role="region"
                        aria-live="polite"
                        aria-label="Notifications"
                        className="pointer-events-none fixed bottom-5 left-1/2 z-[200] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
                    >
                        {toasts.map((toast) => (
                            <div
                                key={toast.id}
                                role={toast.tone === 'error' ? 'alert' : 'status'}
                                className={cn(
                                    'bg-background pointer-events-auto flex items-center gap-2.5 rounded-xl border border-l-4 px-4 py-3 text-sm font-medium shadow-lg motion-safe:animate-[toast-in_200ms_ease-out]',
                                    TONE_STYLES[toast.tone]
                                )}
                            >
                                <Icon
                                    name={TONE_ICONS[toast.tone]}
                                    className="size-4"
                                />
                                <span className="text-foreground/90">
                                    {toast.message}
                                </span>
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </ToastContext.Provider>
    );
}
