import { useEffect, useRef, useState } from 'react';

/**
 * Whether `value` has changed within the last `durationMs`. It is true on the
 * very render that flips `value` (so a CSS transition can be switched on without
 * the one-frame lag a `useEffect` would add, which would let the change jump),
 * stays true for the duration, then returns to false. The initial mount does not
 * count as a change.
 *
 * Lets a component enable a transition only around a state change while leaving
 * unrelated re-renders (such as scroll updates) instant.
 */
export function useRecentlyChanged<T>(value: T, durationMs: number): boolean {
    const previous = useRef(value);
    const [latched, setLatched] = useState(false);

    const changedNow = previous.current !== value;

    useEffect(() => {
        if (previous.current === value) return;
        previous.current = value;
        setLatched(true);
        const id = setTimeout(() => setLatched(false), durationMs);
        return () => clearTimeout(id);
    }, [value, durationMs]);

    return changedNow || latched;
}
