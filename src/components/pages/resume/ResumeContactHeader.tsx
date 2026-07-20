import type { ContactLink } from '@/components/pages/resume/types';
import ContactLine from '@/components/pages/resume/ContactLine';

/** Centered name + contact row (and location/availability) at the top. */
export default function ResumeContactHeader({
    name,
    contacts,
    location,
}: {
    name: string;
    contacts: ContactLink[];
    location?: string;
}) {
    return (
        <header className="text-center">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl print:text-[16pt]">
                {name}
            </h1>
            <div className="mt-2 print:mt-1">
                <ContactLine contacts={contacts} />
            </div>
            {location && (
                <p className="text-foreground/70 mt-1 font-mono text-[11px] print:font-[Helvetica,Arial,sans-serif] print:text-[9pt]">
                    {location}
                </p>
            )}
        </header>
    );
}
