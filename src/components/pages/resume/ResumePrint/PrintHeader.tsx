import type { ContactLink } from '@/components/pages/resume/types';
import PrintContactLine from '@/components/pages/resume/ResumePrint/PrintContactLine';

/** Name, headline, location, contacts and languages over a dark rule. */
export default function PrintHeader({
    name,
    headline,
    location,
    languages,
    contacts,
}: {
    name: string;
    headline: string;
    location?: string;
    languages?: string;
    contacts: ContactLink[];
}) {
    return (
        <header className="border-b-2 border-neutral-900 pb-2.5">
            {/* A paragraph, not an h1: the screen card already holds the
                page's one h1, and this layout ships in the same HTML. */}
            <p className="text-[22pt] leading-tight font-bold tracking-tight text-neutral-900">
                {name}
            </p>
            <p className="mt-0.5 text-[12pt] font-semibold text-neutral-900">
                {headline}
            </p>
            {location && <p className="mt-1 text-neutral-500">{location}</p>}
            <PrintContactLine contacts={contacts} />
            {languages && (
                <p className="text-neutral-500">Languages: {languages}</p>
            )}
        </header>
    );
}
