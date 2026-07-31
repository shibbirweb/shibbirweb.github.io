import { cn } from '@/utils/cn';
import SpotlightBorder from '@/components/pages/common/SpotlightBorder';
import SpotlightGroup from '@/components/pages/common/SpotlightGroup';
import { spotlightSurfaceProps } from '@/components/pages/common/spotlightSurface';
import type {
    ContactLink,
    ResumeSectionData,
} from '@/components/pages/resume/types';
import ResumeContactHeader from '@/components/pages/resume/ResumeContactHeader';
import styles from '@/components/pages/resume/ResumeDocument.module.css';
import ResumeSection from '@/components/pages/resume/ResumeSection';
import ResumeSectionBlock from '@/components/pages/resume/ResumeSectionBlock';

/**
 * The framed "document" card. On screen it is a bordered, elevated panel lit by the
 * cursor like the site's other card surfaces; in print the framing and the
 * spotlight are both stripped so the resume fills the page like a printed CV.
 * Thin by design: it renders the contact header, then maps the data-driven
 * sections through the shared shell and the section dispatcher.
 *
 * The SpotlightGroup wrapper owns the pointer listener and is `contents`, so it
 * generates no box and leaves both the screen and print layouts exactly as they
 * were; the article itself is the lit surface.
 */
export default function ResumeDocument({
    name,
    location,
    contacts,
    sections,
}: {
    name: string;
    location?: string;
    contacts: ContactLink[];
    sections: ResumeSectionData[];
}) {
    return (
        <SpotlightGroup className="contents">
            <article
                {...spotlightSurfaceProps}
                className={cn(
                    styles.card,
                    'border-foreground/10 bg-foreground/[0.015] relative isolate mx-auto max-w-4xl rounded-xl border px-6 py-8 text-[13px] leading-relaxed shadow-sm sm:px-12 sm:py-12',
                    'print:mx-0 print:max-w-none print:rounded-none print:border-0 print:bg-transparent print:p-0 print:font-[Helvetica,Arial,sans-serif] print:text-[10pt] print:leading-[1.35] print:text-black print:shadow-none'
                )}
            >
                <ResumeContactHeader
                    name={name}
                    contacts={contacts}
                    location={location}
                />

                <div className="mt-7 flex flex-col gap-6 print:mt-4 print:gap-[13px]">
                    {sections.map((section) => (
                        <ResumeSection
                            key={section.label}
                            label={section.label}
                        >
                            <ResumeSectionBlock section={section} />
                        </ResumeSection>
                    ))}
                </div>

                <SpotlightBorder
                    className={cn(styles.spotlightBorder, 'print:hidden')}
                />
            </article>
        </SpotlightGroup>
    );
}
