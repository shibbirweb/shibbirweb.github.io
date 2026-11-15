import Link from 'next/link';
import { monoTextClassName } from '@/components/pages/common/monoText';
import { tagHandle } from '@/components/pages/articles/ArticleRow/tagHandle';
import { cn } from '@/utils/cn';

/** How many tags a row shows; the article page itself lists them all. */
export const teaserTagLimit = 3;

/**
 * The row's first few tags as compact mono `#tag` links to the filtered
 * articles list. They sit above the row's stretched link (`relative z-10`) so
 * they stay clickable on their own.
 */
export default function ArticleRowTags({ tags }: { tags: string[] }) {
    return (
        <ul
            aria-label="Tags"
            className={cn(
                monoTextClassName,
                'relative z-10 mt-2 flex flex-wrap gap-x-3 text-[11px]'
            )}
        >
            {tags.slice(0, teaserTagLimit).map((tag) => (
                <li key={tag}>
                    <Link
                        href={`/articles?tag=${encodeURIComponent(tag)}`}
                        className="focus-ring text-foreground/60 hover:text-foreground inline-flex min-h-6 items-center rounded-sm transition-colors"
                    >
                        {tagHandle(tag)}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
