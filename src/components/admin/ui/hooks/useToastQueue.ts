'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastItem {
    id: number;
    message: string;
    tone: ToastTone;
}

/**
 * Owns the toast queue: appends notifications, auto-dismisses each after a
 * delay, and clears every pending timer on unmount (no setState-after-unmount).
 */
export function useToastQueue(durationMs = 4000) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const nextId = useRef(1);
    const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

    const notify = useCallback(
        (message: string, tone: ToastTone = 'info') => {
            const id = nextId.current++;
            setToasts((current) => [...current, { id, message, tone }]);
            const timer = setTimeout(() => {
                setToasts((current) => current.filter((toast) => toast.id !== id));
                timers.current.delete(id);
            }, durationMs);
            timers.current.set(id, timer);
        },
        [durationMs]
    );

    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach((timer) => clearTimeout(timer));
    }, []);

    return { toasts, notify };
}
