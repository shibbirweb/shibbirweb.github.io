import { monoTextClassName } from '@/components/pages/common/monoText';
import { cn } from '@/utils/cn';

/** "3 articles" in the mono meta style, with the noun agreeing with the count. */
export default function ArticleCount({ count }: { count: number }) {
    return (
        <p
            className={cn(
                monoTextClassName,
                'text-foreground/60 text-xs tracking-wider uppercase'
            )}
        >
            {count} {count === 1 ? 'article' : 'articles'}
        </p>
    );
}
