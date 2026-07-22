import Layers from '@/components/icons/layers';
import { cn } from '@/utils/cn';

/**
 * A compact "Part N of M" marker plus the series name, shown at the top of an
 * ArticleCard when the article belongs to a multi-part series. It reuses the
 * TechStack chip vocabulary and mirrors the SeriesNav "Part N of M" label so the
 * list and the article page read as one system. Standalone articles omit it, so
 * the presence of this marker is what tells a series card apart from a one-off in
 * the grid. The cover accent shows only through the icon glyph (via --accent-from,
 * set on the card); the text stays on the foreground token to keep contrast solid
 * in both themes. `total` is the number of published parts; when it is unknown or
 * one, the label falls back to "Part N".
 */
export default function SeriesBadge({
    order,
    total,
    name,
    compact = false,
}: {
    order: number;
    total?: number;
    name: string;
    compact?: boolean;
}) {
    const partLabel =
        total && total > 1 ? `Part ${order} of ${total}` : `Part ${order}`;

    return (
        <span
            className={cn(
                'flex w-full items-center gap-2',
                compact ? 'mb-2.5' : 'mb-3'
            )}
        >
            <span className="border-foreground/15 bg-foreground/[0.04] text-foreground/80 inline-flex flex-none items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums">
                <Layers
                    aria-hidden
                    className="size-3.5 text-[var(--accent-from,var(--foreground))]"
                />
                {partLabel}
            </span>
            <span className="text-foreground/55 min-w-0 truncate text-xs">
                {name}
            </span>
        </span>
    );
}
