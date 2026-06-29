import { cn } from '@/utils/cn';
import type { ArticleDifficulty } from '@/lib/posts';

/** Per-level colour, kept subtle so the badge reads as a label, not an alert. */
const LEVEL_STYLES: Record<ArticleDifficulty, string> = {
    Beginner:
        'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    Intermediate:
        'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    Advanced:
        'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
};

/** Number of filled bars that signals the level at a glance. */
const LEVEL_BARS: Record<ArticleDifficulty, number> = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
};

/** A small pill conveying an article's difficulty with a label and signal bars. */
export default function DifficultyBadge({
    level,
    className,
}: {
    level: ArticleDifficulty;
    className?: string;
}) {
    const filled = LEVEL_BARS[level];
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                LEVEL_STYLES[level],
                className
            )}
        >
            <span
                aria-hidden
                className="flex items-end gap-0.5"
            >
                {[0, 1, 2].map((bar) => (
                    <span
                        key={bar}
                        className={cn(
                            'w-0.5 rounded-full bg-current',
                            bar === 0 ? 'h-1.5' : bar === 1 ? 'h-2' : 'h-2.5',
                            bar < filled ? 'opacity-100' : 'opacity-30'
                        )}
                    />
                ))}
            </span>
            {level}
        </span>
    );
}
