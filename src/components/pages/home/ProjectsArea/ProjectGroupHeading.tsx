import { monoTextClassName } from '@/components/pages/common/monoText';
import { cn } from '@/utils/cn';

/**
 * A project group's heading, set like an index divider: the title, a hairline
 * that fills the row, and the group's project count in mono.
 */
export default function ProjectGroupHeading({
    title,
    count,
}: {
    title: string;
    count: number;
}) {
    return (
        <div className="flex items-center gap-4">
            <h3 className="text-foreground/70 text-sm font-bold tracking-wider uppercase">
                {title}
            </h3>
            <span
                aria-hidden
                className="bg-foreground/10 h-px grow"
            />
            <span
                className={cn(monoTextClassName, 'text-foreground/50 text-xs')}
            >
                {String(count).padStart(2, '0')}
                <span className="sr-only"> projects</span>
            </span>
        </div>
    );
}
