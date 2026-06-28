'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import styles from '@/components/animations/AnimatedUnderline/AnimatedUnderline.module.css';

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
    const underlineRef = useRef<HTMLElement>(null);
    const [animationState, setAnimationState] = useState<
        'static' | 'idle' | 'run'
    >('static');

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return; // keep the static, fully-drawn underline
        }
        const element = underlineRef.current;
        if (!element || !('IntersectionObserver' in window)) {
            setAnimationState('run');
            return;
        }
        // collapse first (happens off-screen, so there is no visible flash)
        setAnimationState('idle');
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setAnimationState('run');
                        observer.disconnect();
                        break;
                    }
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <strong
            ref={underlineRef}
            className={cn(styles.underline, styles[variant])}
            data-underline-state={
                animationState === 'static' ? undefined : animationState
            }
            style={
                {
                    '--underline-color': color,
                    '--underline-delay': `${delayMs}ms`,
                } as React.CSSProperties
            }
        >
            {children}
        </strong>
    );
}
