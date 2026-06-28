import { cn } from '@/utils/cn';
import { HTMLAttributes } from 'react';

interface SectionHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3';
}

export default function SectionHeading({
    children,
    className,
    as: Heading = 'h2',
    ...rest
}: SectionHeadingProps) {
    return (
        <Heading
            className={cn('text-3xl font-bold sm:text-4xl', className)}
            {...rest}
        >
            {children}
        </Heading>
    );
}
