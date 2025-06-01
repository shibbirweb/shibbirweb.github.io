import { cn } from '@/utils/cn';
import { HTMLAttributes } from 'react';

export default function GridBackgroundComponent(
    props: HTMLAttributes<HTMLDivElement>
) {
    const { className, ...rest } = props;
    return (
        <div
            className={cn(
                'absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#73737320_1px,transparent_1px),linear-gradient(to_bottom,#73737320_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)] bg-size-[20px_20px]',
                className
            )}
            {...rest}
        />
    );
}
