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
 * cursor like the site's other card surfaces. It is the screen layout only: the
 * page hides it in print and shows `ResumePrint` instead.
 * Thin by design: it renders the contact header, then maps the data-driven
 * sections through the shared shell and the section dispatcher.
 *
 * The SpotlightGroup wrapper owns the pointer listener and is `contents`, so it
 * generates no box and leaves the layout exactly as it
 * were; the article itself is the lit surface.
 */
export default function ResumeDocument({
    name,
    headline,
    location,
    languages,
    contacts,
    sections,
}: {
    name: string;
    headline?: string;
    location?: string;
    languages?: string;
    contacts: ContactLink[];
    sections: ResumeSectionData[];
}) {
    return (
        <SpotlightGroup className="contents">
            <article
                {...spotlightSurfaceProps}
                className={cn(
                    styles.card,
                    'border-foreground/10 bg-foreground/[0.015] relative isolate mx-auto max-w-4xl rounded-xl border px-6 py-8 text-[13px] leading-relaxed shadow-sm sm:px-12 sm:py-12'
                )}
            >
                <ResumeContactHeader
                    name={name}
                    headline={headline}
                    contacts={contacts}
                    location={location}
                    languages={languages}
                />

                <div className="mt-7 flex flex-col gap-6">
                    {sections.map((section) => (
                        <ResumeSection
                            key={section.label}
                            label={section.label}
                        >
                            <ResumeSectionBlock section={section} />
                        </ResumeSection>
                    ))}
                </div>

                <SpotlightBorder className={styles.spotlightBorder} />
            </article>
        </SpotlightGroup>
    );
}
