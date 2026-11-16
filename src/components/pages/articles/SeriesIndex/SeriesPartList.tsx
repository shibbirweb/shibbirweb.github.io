import Link from 'next/link';
import { cn } from '@/utils/cn';
import type { SeriesShelfPart } from '@/utils/seriesShelf';

/** A series' parts as numbered steps, each linking to its article. */
export default function SeriesPartList({
    parts,
    className,
}: {
    parts: SeriesShelfPart[];
    className?: string;
}) {
    return (
        <ol className={cn('space-y-0.5', className)}>
            {parts.map((part, index) => (
                <li key={part.slug}>
                    <Link
                        href={`/articles/${part.slug}`}
                        aria-label={`Part ${index + 1}: ${part.title}`}
                        className="focus-ring text-foreground/75 hover:bg-foreground/[0.05] hover:text-foreground -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors"
                    >
                        <span
                            aria-hidden
                            className="border-foreground/15 text-foreground/70 flex size-6 flex-none items-center justify-center rounded-full border text-xs font-semibold"
                        >
                            {index + 1}
                        </span>
                        <span className="leading-snug">{part.title}</span>
                    </Link>
                </li>
            ))}
        </ol>
    );
}
