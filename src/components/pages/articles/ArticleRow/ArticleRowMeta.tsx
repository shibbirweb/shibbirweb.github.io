import { monoTextClassName } from '@/components/pages/common/monoText';
import { cn } from '@/utils/cn';

/**
 * The row's mono kicker: the article's category (or its first tag when it has
 * none), the reading time, and the series part when it belongs to one.
 */
export default function ArticleRowMeta({
    label,
    readingMinutes,
    seriesPart,
}: {
    label?: string;
    readingMinutes: number;
    seriesPart?: string;
}) {
    const items = [label, `${readingMinutes} min read`, seriesPart].filter(
        (item): item is string => Boolean(item)
    );

    return (
        <p
            className={cn(
                monoTextClassName,
                'text-foreground/60 flex flex-wrap items-center text-[11px] tracking-wider uppercase'
            )}
        >
            {items.map((item, index) => (
                <span
                    key={item}
                    className="flex items-center"
                >
                    {index > 0 && (
                        <span
                            aria-hidden
                            className="text-foreground/25 mx-2"
                        >
                            /
                        </span>
                    )}
                    {item}
                </span>
            ))}
        </p>
    );
}
