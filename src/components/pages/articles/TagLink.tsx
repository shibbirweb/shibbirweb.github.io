import Link from 'next/link';
import { cn } from '@/utils/cn';

/** A clickable tag pill that filters the articles list by that tag. */
export default function TagLink({
    tag,
    className,
}: {
    tag: string;
    className?: string;
}) {
    return (
        <li className="flex">
            <Link
                href={`/articles?tag=${encodeURIComponent(tag)}`}
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
