import type { ResumeSectionData } from '@/components/pages/resume/types';
import PrintAwardList from '@/components/pages/resume/ResumePrint/PrintAwardList';
import PrintBulletList from '@/components/pages/resume/ResumePrint/PrintBulletList';
import PrintEducationList from '@/components/pages/resume/ResumePrint/PrintEducationList';
import PrintExperienceList from '@/components/pages/resume/ResumePrint/PrintExperienceList';
import PrintParagraphs from '@/components/pages/resume/ResumePrint/PrintParagraphs';
import PrintProjectList from '@/components/pages/resume/ResumePrint/PrintProjectList';
import PrintSkillsTable from '@/components/pages/resume/ResumePrint/PrintSkillsTable';

/**
 * Print twin of `ResumeSectionBlock`: picks the printed body for each section
 * `kind`. A new `kind` needs a `case` here as well as on screen.
 */
export default function PrintSectionBlock({
    section,
}: {
    section: ResumeSectionData;
}) {
    switch (section.kind) {
        case 'experience':
            return <PrintExperienceList entries={section.entries} />;
        case 'projects':
            return (
                <PrintProjectList
                    entries={section.entries}
                    layout={section.layout}
                />
            );
        case 'skills':
            return <PrintSkillsTable groups={section.groups} />;
        case 'bullets':
            return <PrintBulletList items={section.items} />;
        case 'education':
            return <PrintEducationList entries={section.entries} />;
        case 'awards':
            return <PrintAwardList entries={section.entries} />;
        case 'text':
            return <PrintParagraphs paragraphs={section.paragraphs} />;
    }
}
