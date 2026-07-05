import type { ResumeSectionData } from '@/components/pages/resume/types';
import ExperienceList from '@/components/pages/resume/ExperienceList';
import ProjectsList from '@/components/pages/resume/ProjectsList';
import SkillsTable from '@/components/pages/resume/SkillsTable';
import BulletList from '@/components/pages/resume/BulletList';
import EducationList from '@/components/pages/resume/EducationList';
import AwardsList from '@/components/pages/resume/AwardsList';
import TextBlock from '@/components/pages/resume/TextBlock';

/**
 * Dispatches a resume section to its body by `kind`. This is the single place a
 * new section layout is wired: add a `kind` to `ResumeSectionData`, a `case`
 * here, and a body component (same flow as `UsesBlock`).
 */
export default function ResumeSectionBlock({
    section,
}: {
    section: ResumeSectionData;
}) {
    switch (section.kind) {
        case 'experience':
            return <ExperienceList entries={section.entries} />;
        case 'projects':
            return <ProjectsList entries={section.entries} />;
        case 'skills':
            return <SkillsTable groups={section.groups} />;
        case 'bullets':
            return <BulletList items={section.items} />;
        case 'education':
            return <EducationList entries={section.entries} />;
        case 'awards':
            return <AwardsList entries={section.entries} />;
        case 'text':
            return <TextBlock text={section.text} />;
    }
}
