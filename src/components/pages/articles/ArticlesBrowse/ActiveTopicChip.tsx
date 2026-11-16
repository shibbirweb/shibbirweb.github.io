import Link from 'next/link';
import CloseIcon from '@/components/icons/close';

/** The applied topic, shown beside Filters while the panel is closed. */
export default function ActiveTopicChip({
    tag,
    clearHref,
}: {
    tag: string;
    clearHref: string;
}) {
    return (
        <Link
            href={clearHref}
            aria-label={`Topic: ${tag}, clear filter`}
            className="focus-ring border-foreground bg-foreground text-background inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm sm:min-h-9"
        >
            {tag}
            <CloseIcon
                aria-hidden
                className="size-3.5"
            />
        </Link>
    );
}
