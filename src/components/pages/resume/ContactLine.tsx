import { Fragment } from 'react';
import type { ContactLink } from '@/components/pages/resume/types';
import ExternalLink from '@/components/pages/resume/ExternalLink';

/** Pipe-separated contact links (email, LinkedIn, GitHub, site). */
export default function ContactLine({
    contacts,
}: {
    contacts: ContactLink[];
}) {
    return (
        <p className="text-foreground/70 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 font-mono text-[11px] print:font-[Helvetica,Arial,sans-serif] print:text-[9pt]">
            {contacts.map((contact, index) => (
                <Fragment key={contact.href}>
                    {index > 0 && (
                        <span
                            aria-hidden="true"
                            className="text-foreground/30 select-none"
                        >
                            |
                        </span>
                    )}
                    <ExternalLink
                        href={contact.href}
                        className="hover:text-foreground transition-colors"
                    >
                        {contact.label}
                    </ExternalLink>
                </Fragment>
            ))}
        </p>
    );
}
