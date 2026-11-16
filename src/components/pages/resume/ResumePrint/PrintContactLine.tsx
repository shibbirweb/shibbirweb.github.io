import { Fragment } from 'react';
import type { ContactLink } from '@/components/pages/resume/types';
import ExternalLink from '@/components/pages/resume/ExternalLink';

/** Middot-separated contact links, printed dark like the text. */
export default function PrintContactLine({
    contacts,
}: {
    contacts: ContactLink[];
}) {
    return (
        <p className="text-neutral-900">
            {contacts.map((contact, index) => (
                <Fragment key={contact.href}>
                    {index > 0 && (
                        <span
                            aria-hidden="true"
                            className="text-neutral-400"
                        >
                            {' · '}
                        </span>
                    )}
                    <ExternalLink href={contact.href}>
                        {contact.label}
                    </ExternalLink>
                </Fragment>
            ))}
        </p>
    );
}
