import { cn } from '@/utils/cn';
import { HTMLAttributes } from 'react';

interface SectionHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
    accentClassName?: string;
    as?: 'h1' | 'h2' | 'h3';
}

export default function SectionHeading({
    children,
    className,
    accentClassName,
    as: Heading = 'h2',
    ...rest
}: SectionHeadingProps) {
    return (
        <Heading
            className={cn(
                'text-4xl font-bold sm:text-5xl md:text-6xl',
                className
            )}
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
        </Heading>
    );
}
