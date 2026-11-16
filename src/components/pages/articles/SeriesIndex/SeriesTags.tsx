import TagLink from '@/components/pages/articles/TagLink';
import { cn } from '@/utils/cn';

/** A series' tags as small pills that filter the series page by that topic. */
export default function SeriesTags({
    tags,
    className,
}: {
    tags: string[];
    className?: string;
}) {
    if (tags.length === 0) {
        return null;
    }

    return (
        <ul
            aria-label="Topics"
            className={cn('flex flex-wrap gap-2', className)}
        >
            {tags.map((tag) => (
                <TagLink
                    key={tag}
                    tag={tag}
                    basePath="/articles/series"
                    className="px-2.5 py-0.5 text-xs"
                />
            ))}
        </ul>
    );
}
