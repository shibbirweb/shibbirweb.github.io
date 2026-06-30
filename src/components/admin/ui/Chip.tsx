import { cn } from '@/utils/cn';

/** A small outline chip for roadmap/meta labels (e.g. "Planned", "Soon"). */
export default function Chip({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'text-foreground/45 inline-flex items-center rounded-full border border-foreground/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                className
            )}
        >
            {children}
        </span>
    );
}
