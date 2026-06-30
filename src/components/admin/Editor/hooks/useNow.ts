'use client';

import { useEffect, useState } from 'react';

/** A clock that re-renders on an interval, for live "saved 5s ago" labels. */
export function useNow(intervalMs = 10000): number {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs]);
    return now;
}
