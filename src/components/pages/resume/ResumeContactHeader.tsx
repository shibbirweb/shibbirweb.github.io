import type { ContactLink } from '@/components/pages/resume/types';
import ContactLine from '@/components/pages/resume/ContactLine';

/** Centered name and headline, the contact row, then location and languages. */
export default function ResumeContactHeader({
    name,
    headline,
    contacts,
    location,
    languages,
}: {
    name: string;
    headline?: string;
    contacts: ContactLink[];
    location?: string;
    languages?: string;
}) {
    return (
        <header className="text-center">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {name}
            </h1>
            {headline && (
                <p className="text-foreground/80 mt-1.5 text-sm font-semibold">
                    {headline}
                </p>
            )}
            <div className="mt-2">
                <ContactLine contacts={contacts} />
            </div>
            {location && (
                <p className="text-foreground/70 mt-1 font-mono text-[11px]">
                    {location}
                </p>
            )}
            {languages && (
                <p className="text-foreground/70 mt-1 font-mono text-[11px]">
                    Languages: {languages}
                </p>
            )}
        </header>
    );
}
