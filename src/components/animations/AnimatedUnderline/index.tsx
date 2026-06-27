'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import styles from './AnimatedUnderline.module.css';

export type UnderlineVariant =
    | 'draw-right'
    | 'draw-left'
    | 'center'
    | 'highlight'
    | 'rise'
    | 'bounce'
    | 'glow';

interface AnimatedUnderlineProps {
    children: React.ReactNode;
    /** Which unique underline animation to play. */
    variant: UnderlineVariant;
    /** Underline colour as a CSS value, e.g. `var(--color-yellow-500)`. */
    color: string;
    /** Stagger delay in milliseconds. */
    delayMs?: number;
}

/**
 * Highlights a keyword with an underline that animates in (uniquely per
 * variant) once it scrolls into view. Falls back to a static underline when
 * JavaScript is unavailable or the user prefers reduced motion.
 */
export default function AnimatedUnderline({
    children,
    variant,
    color,
    delayMs = 0,
}: AnimatedUnderlineProps) {
    const ref = useRef<HTMLElement>(null);
    const [state, setState] = useState<'static' | 'idle' | 'run'>('static');

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // keep the static, fully-drawn underline
        }
        const el = ref.current;
        if (!el || !('IntersectionObserver' in window)) {
            setState('run');
            return;
        }
        setState('idle'); // collapse first (happens off-screen, no flash)
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setState('run');
                        observer.disconnect();
                        break;
                    }
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <strong
            ref={ref}
            className={cn(styles.au, styles[variant])}
            data-au={state === 'static' ? undefined : state}
            style={
                {
                    '--au-c': color,
                    '--au-delay': `${delayMs}ms`,
                } as React.CSSProperties
            }
        >
            {children}
        </strong>
    );
}
