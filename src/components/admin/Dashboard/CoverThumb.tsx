import { cn } from '@/utils/cn';
import type { ArticleListItem } from '@/lib/admin/types';

/**
 * An article's dashboard thumbnail: the author-provided cover when one exists,
 * otherwise a gradient tile tinted with the article's accent colours. Generated
 * covers are skipped here because they only exist on disk for published posts.
 */
export default function CoverThumb({
    item,
    className,
}: {
    item: ArticleListItem;
    className?: string;
}) {
    if (item.hasCustomCover) {
        return (
            /* eslint-disable-next-line @next/next/no-img-element -- dev-only admin; raw <img> avoids the export optimizer for arbitrary covers. */
            <img
                src={item.cover}
                alt=""
                loading="lazy"
                className={cn('object-cover', className)}
            />
        );
    }
    const [from, to] = item.coverColors;
    return (
        <div
            className={cn(
                'grid place-items-center text-white/90',
                className
            )}
            style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
            aria-hidden
        >
            <span className="font-display text-lg font-bold drop-shadow">
                {(item.title.trim()[0] ?? '?').toUpperCase()}
            </span>
        </div>
    );
}
