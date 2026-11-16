import type {
    ContactLink,
    ResumeSectionData,
} from '@/components/pages/resume/types';
import { cn } from '@/utils/cn';
import styles from '@/components/pages/resume/ResumePrint/ResumePrint.module.css';
import PrintHeader from '@/components/pages/resume/ResumePrint/PrintHeader';
import PrintSection from '@/components/pages/resume/ResumePrint/PrintSection';
import PrintSectionBlock from '@/components/pages/resume/ResumePrint/PrintSectionBlock';

/**
 * The printed (Save as PDF) resume. Hidden on screen and shown only in print,
 * while the framed on-screen `ResumeDocument` is hidden in print, so each
 * medium gets its own layout from the same `resumeSections` data. This one is a
 * classic one-column CV: a left-aligned name, a bold headline, contact lines,
 * then dark uppercase section headings over hairline rules, sized to fit one
 * A4 page (the paper size and margins are set in its CSS Module).
 */
export default function ResumePrint({
    name,
    headline,
    location,
    languages,
    contacts,
    sections,
}: {
    name: string;
    headline: string;
    location?: string;
    languages?: string;
    contacts: ContactLink[];
    sections: ResumeSectionData[];
}) {
    return (
        <article
            data-testid="resume-print"
            className={cn(
                styles.document,
                'hidden font-sans text-[9.5pt] leading-[1.35] text-neutral-800 print:block'
            )}
        >
            <PrintHeader
                name={name}
                headline={headline}
                location={location}
                languages={languages}
                contacts={contacts}
            />

            <div className="mt-2.5 flex flex-col gap-2.5">
                {sections.map((section) => (
                    <PrintSection
                        key={section.label}
                        label={section.label}
                    >
                        <PrintSectionBlock section={section} />
                    </PrintSection>
                ))}
            </div>
        </article>
    );
}
