import type { ReactNode } from 'react';
import ExternalLink from '@/components/pages/resume/ExternalLink';

/** An entry name, linked when a URL is known and plain text otherwise. */
export default function OptionalExternalLink({
    href,
    className,
    children,
}: {
    href?: string;
    className?: string;
    children: ReactNode;
}) {
    if (!href) {
        return <span className={className}>{children}</span>;
    }

    return (
        <ExternalLink
            href={href}
            className={className}
        >
            {children}
        </ExternalLink>
    );
}
