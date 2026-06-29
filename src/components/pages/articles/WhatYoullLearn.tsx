import CheckIcon from '@/components/icons/check';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';

/**
 * A boxed summary of the key takeaways, drawn from the article's `learn`
 * frontmatter, so a reader can decide in seconds whether the piece is for them.
 * The card and its check marks pick up the article's cover accent.
 */
export default function WhatYoullLearn({
    items,
    accentColors,
    className,
}: {
    items: string[];
    accentColors: readonly [string, string];
    className?: string;
}) {
    if (items.length === 0) return null;

    return (
        <section
            aria-labelledby="what-youll-learn"
            style={accentStyle(accentColors)}
            className={cn(
                'border-foreground/10 relative overflow-hidden rounded-2xl border p-6 sm:p-8',
                className
            )}
        >
            {/* A faint accent wash bleeds in from the leading edge of the card. */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-[var(--accent-from)] to-[var(--accent-to)]"
            />
            <h2
                id="what-youll-learn"
                className="text-foreground/45 text-xs font-semibold tracking-[0.12em] uppercase"
            >
                What you&rsquo;ll learn
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                    <li
                        key={item}
                        className="flex items-start gap-3"
                    >
                        <CheckIcon className="mt-0.5 size-4 flex-none text-[var(--accent-to)]" />
                        <span className="text-foreground/80 text-sm leading-relaxed">
                            {item}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
