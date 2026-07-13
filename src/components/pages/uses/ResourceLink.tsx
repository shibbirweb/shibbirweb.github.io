import { cn } from '@/utils/cn';

interface ResourceLinkProps {
    label?: string;
    title: string;
    href: string;
    description?: string;
}

/** Host of a URL, without the leading www, for the mono source tag. */
function hostOf(href: string) {
    try {
        return new URL(href).hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

/**
 * An editorial external-resource row: a display-face title with a nudging arrow
 * and the source host in mono, over an optional one-line description. Used to
 * point off-page (for example, to a gist of editor settings) instead of dumping
 * config inline.
 */
export default function ResourceLink({
    label,
    title,
    href,
    description,
}: ResourceLinkProps) {
    const host = hostOf(href);

    return (
        <div>
            {label && (
                <h3 className="text-foreground/40 font-mono text-[11px] tracking-[0.18em] uppercase">
                    {label}
                </h3>
            )}
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    'group border-foreground/15 flex items-baseline justify-between gap-4 border-y py-3.5',
                    label && 'mt-3'
                )}
            >
                <span className="font-display text-lg font-semibold transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {title}
                    <span
                        aria-hidden="true"
                        className="ml-1.5 inline-block motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                    >
                        ↗
                    </span>
                </span>
                {host && (
                    <span className="text-foreground/40 shrink-0 font-mono text-xs">
                        {host}
                    </span>
                )}
            </a>
            {description && (
                <p className="text-foreground/60 mt-2 text-sm leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}
