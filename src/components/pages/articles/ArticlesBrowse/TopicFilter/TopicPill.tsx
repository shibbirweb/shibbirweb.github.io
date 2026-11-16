import Link from 'next/link';
import CloseIcon from '@/components/icons/close';
import {
    formatCount,
    type CountNoun,
} from '@/components/pages/articles/ArticlesBrowse/countNoun';
import { monoTextClassName } from '@/components/pages/common/monoText';
import { cn } from '@/utils/cn';

const pillBase =
    'focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors sm:min-h-9';
const pillInactive =
    'border-foreground/15 text-foreground/75 hover:border-foreground/50 hover:text-foreground';
const pillActive = 'border-foreground bg-foreground text-background';

/**
 * What a screen reader hears for a pill, e.g. "Laravel (3 articles)", with
 * ", clear filter" on the selected one. Spelled out as one label because the
 * visible pieces sit in separate spans, which would otherwise run together.
 */
function pillLabel(
    label: string,
    count: number,
    countNoun: CountNoun,
    clearsFilter: boolean
): string {
    const name = `${label} (${formatCount(count, countNoun)})`;

    return clearsFilter ? `${name}, clear filter` : name;
}

/**
 * One topic in the filter, with its article count. The selected topic is filled
 * and links back to every article, so picking it again clears the filter.
 */
export default function TopicPill({
    label,
    count,
    href,
    isActive,
    countNoun,
    clearsFilter = false,
    className,
}: {
    label: string;
    count: number;
    href: string;
    isActive: boolean;
    countNoun: CountNoun;
    /** True for the selected topic, whose link removes the filter. */
    clearsFilter?: boolean;
    className?: string;
}) {
    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            aria-label={pillLabel(label, count, countNoun, clearsFilter)}
            className={cn(
                pillBase,
                isActive ? pillActive : pillInactive,
                className
            )}
        >
            {label}
            <span
                className={cn(
                    monoTextClassName,
                    'text-xs',
                    isActive ? 'text-background/70' : 'text-foreground/45'
                )}
            >
                {count}
            </span>
            {clearsFilter && (
                <CloseIcon
                    aria-hidden
                    className="-mr-1 size-3.5"
                />
            )}
        </Link>
    );
}
