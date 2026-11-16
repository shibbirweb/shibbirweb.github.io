import Link from 'next/link';
import { cn } from '@/utils/cn';

/**
 * A clickable tag pill that filters a list by that tag: the articles list by
 * default, or the page `basePath` names (the series page filters series).
 */
export default function TagLink({
    tag,
    basePath = '/articles',
    className,
}: {
    tag: string;
    basePath?: string;
    className?: string;
}) {
    return (
        <li className="flex">
            <Link
                href={`${basePath}?tag=${encodeURIComponent(tag)}`}
                className={cn(
                    'focus-ring border-foreground/15 text-foreground/70 hover:border-foreground/50 hover:text-foreground inline-block rounded-full border transition-colors',
                    className
                )}
            >
                {tag}
            </Link>
        </li>
    );
}
