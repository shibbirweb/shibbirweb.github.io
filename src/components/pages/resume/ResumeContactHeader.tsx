import { siteName } from '@/config/constants';
import type { ContactLink } from '@/components/pages/resume/types';
import ContactLine from '@/components/pages/resume/ContactLine';

/** Centered name + contact row at the top of the document. */
export default function ResumeContactHeader({
    contacts,
}: {
    contacts: ContactLink[];
}) {
    return (
        <header className="text-center">
            <p className="text-xl font-bold tracking-tight sm:text-2xl print:text-[16pt]">
                {siteName}
            </p>
            <div className="mt-2 print:mt-1">
                <ContactLine contacts={contacts} />
            </div>
        </header>
    );
}
