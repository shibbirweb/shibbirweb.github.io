import { HTMLAttributes } from 'react';
import GridBackground from '@/components/backgrounds/GridBackground';
import { cn } from '@/utils/cn';

export default function WithGridAnimatedBackgroundWrapper({
    children,
    className,
    ...rest
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('relative', className)}
            {...rest}
        >
            {children}
            <GridBackground
                className="opacity-20 motion-safe:animate-pulse"
                style={{
                    animationDuration: '5s',
                }}
            />
        </div>
    );
}
