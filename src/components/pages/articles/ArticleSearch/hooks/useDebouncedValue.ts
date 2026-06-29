import { useEffect, useState } from 'react';

/**
 * Returns `value` delayed by `delayMs`, re-emitting only once it has stopped
 * changing for that window. Used to hold off recomputing search suggestions
 * until the user pauses typing.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}
