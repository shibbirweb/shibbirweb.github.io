import { monoTextClassName } from '@/components/pages/common/monoText';
import { cn } from '@/utils/cn';

/**
 * The tile's mono header line: its number within its own project group
 * (zero-padded, decorative) and its category.
 */
export default function ProjectCardMeta({
    number,
    category,
}: {
    number: number;
    category: string;
}) {
    return (
        <p
            className={cn(
                monoTextClassName,
                'text-foreground/60 flex items-center gap-2 text-[11px] tracking-wider uppercase'
            )}
        >
            <span
                aria-hidden
                className="text-foreground/40"
            >
                {String(number).padStart(2, '0')}
            </span>
            <span
                aria-hidden
                className="text-foreground/25"
            >
                /
            </span>
            <span>{category}</span>
        </p>
    );
}
