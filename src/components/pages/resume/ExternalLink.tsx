import type { ReactNode } from 'react';

/**
 * Anchor that opens external (http/https) URLs in a new tab with a safe `rel`.
 * `mailto:`/`tel:` links are left to open in their handler (no new tab).
 */
export default function ExternalLink({
    href,
    className,
    children,
}: {
    href: string;
    className?: string;
    children: ReactNode;
}) {
    const opensInNewTab = href.startsWith('http');
    return (
        <a
            href={href}
            className={className}
            target={opensInNewTab ? '_blank' : undefined}
            rel={opensInNewTab ? 'noopener noreferrer' : undefined}
        >
            {children}
        </a>
    );
}
