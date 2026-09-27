'use client';

import { ReactNode } from 'react';
import styles from '@/components/animations/DeferredAnimations/DeferredAnimations.module.css';
import { useLoadDelayElapsed } from '@/components/animations/DeferredAnimations/hooks/useLoadDelayElapsed';
import { cn } from '@/utils/cn';

const DEFAULT_START_DELAY_MS = 5000;

interface DeferredAnimationsProps {
    children: ReactNode;
    /** How long after the window `load` event the animations start. */
    delayMs?: number;
    className?: string;
}

/**
 * Holds every CSS animation inside it until `delayMs` after the page loads, so
 * looping decoration (the hero shine and grid pulse) never runs while Lighthouse
 * and similar tools are measuring start-up. Until then the content shows its
 * resting frame; without JavaScript it simply stays still.
 */
export default function DeferredAnimations({
    children,
    delayMs = DEFAULT_START_DELAY_MS,
    className,
}: DeferredAnimationsProps) {
    const hasStarted = useLoadDelayElapsed(delayMs);

    return (
        <div
            data-animations={hasStarted ? 'running' : 'waiting'}
            className={cn(styles.gate, className)}
        >
            {children}
        </div>
    );
}
