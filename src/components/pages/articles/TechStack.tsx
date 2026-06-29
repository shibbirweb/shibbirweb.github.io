import { cn } from '@/utils/cn';

/**
 * The concrete tools an article builds on, shown as a labelled strip of
 * monospace chips. Distinct from tags (which are clickable topic filters): these
 * are non-interactive stack markers that tell the reader what they will be
 * working with.
 */
export default function TechStack({
    tech,
    className,
}: {
    tech: string[];
    className?: string;
}) {
    if (tech.length === 0) return null;

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            <span className="text-foreground/45 text-xs font-semibold tracking-[0.1em] uppercase">
                Stack
            </span>
            <ul className="flex flex-wrap gap-2">
                {tech.map((item) => (
                    <li
                        key={item}
                        className="border-foreground/10 bg-foreground/[0.03] text-foreground/75 rounded-md border px-2 py-0.5 font-mono text-xs"
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
