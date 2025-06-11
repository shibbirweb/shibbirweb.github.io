import { cn } from '@/utils/cn';
import React from 'react';

interface ShinyTextAnimationProps {
    children: React.ReactNode;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

const ShinyTextAnimation: React.FC<ShinyTextAnimationProps> = ({
    children,
    disabled = false,
    speed = 5,
    className = '',
}) => {
    const animationDuration = `${speed}s`;

    return (
        <div
            className={cn(
                'inline-block bg-linear-120 from-black/70 from-40% via-black via-50% to-black/70 to-60% bg-clip-text not-supports-[text-box-trim:trim-both]:!text-[var(--foreground)] motion-safe:text-black/30 dark:from-white/30 dark:via-white dark:to-white/30 motion-safe:dark:text-white/70',
                disabled ? '' : 'motion-safe:animate-shine',
                className
            )}
            style={{
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                animationDuration: animationDuration,
            }}
        >
            {children}
        </div>
    );
};

export default ShinyTextAnimation;
