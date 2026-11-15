import { monoTextClassName } from '@/components/pages/common/monoText';
import { dateTileParts } from '@/components/pages/home/ArticlesArea/ArticleRow/dateTileParts';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatDate';

/**
 * A calendar-page tile showing the publish date, painted with the article's
 * cover colours (--cover-from / --cover-to, set on the row). It stands in for
 * the cover image, which only repeats the title, so the row keeps its colour
 * identity at a fraction of the height. The three visual lines are hidden from
 * assistive tech; a <time> carries the readable date instead.
 */
export default function DateTile({ date }: { date: string }) {
    const parts = dateTileParts(date);
    if (!parts) {
        return null;
    }

    return (
        <time
            dateTime={date}
            className={cn(
                monoTextClassName,
                'flex w-14 shrink-0 flex-col items-center justify-center self-start rounded-lg bg-linear-135 from-(--cover-from) to-(--cover-to) py-2 leading-none text-white sm:w-16'
            )}
        >
            <span className="sr-only">{formatDate(date)}</span>
            <span
                aria-hidden
                className="text-[10px] tracking-widest"
            >
                {parts.month}
            </span>
            <span
                aria-hidden
                className="mt-1 text-xl font-bold sm:text-2xl"
            >
                {parts.day}
            </span>
            <span
                aria-hidden
                className="mt-1 text-[10px] opacity-80"
            >
                {parts.year}
            </span>
        </time>
    );
}
