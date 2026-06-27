import { cn } from '@/utils/cn';
import { HTMLAttributes } from 'react';

interface SectionHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
    accentClassName?: string;
}

export default function SectionHeading({
    children,
    className,
    accentClassName,
    ...rest
}: SectionHeadingProps) {
    return (
        <h2
            className={cn('text-5xl font-bold sm:text-6xl', className)}
            {...rest}
        >
            <span
                className={cn(
                    'underline decoration-4 underline-offset-8',
                    accentClassName ?? 'decoration-emerald-500'
                )}
            >
                {children}
            </span>
        </h2>
    );
}
