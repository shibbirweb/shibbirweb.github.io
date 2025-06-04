import { HTMLAttributes } from 'react';
import GridBackgroundComponent from '@/components/utils/GridBackgroundComponent';
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
            <GridBackgroundComponent
                className="motion-safe:animate-pulse"
                style={{
                    animationDuration: '5s',
                }}
            />
        </div>
    );
}
