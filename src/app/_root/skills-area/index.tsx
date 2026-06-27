import SectionHeading from '@/components/pages/common/SectionHeading';
import SkillGroup from './SkillGroup';
import { skillGroups } from './contents';

export default function SkillsArea() {
    return (
        <section
            id="skills"
            className="py-20 sm:py-28"
        >
            <div className="container mx-auto px-4">
                <SectionHeading accentClassName="decoration-yellow-500">
                    Skills &amp; Tech
                </SectionHeading>

                <div className="mt-12 flex flex-col gap-10">
                    {skillGroups.map((group) => (
                        <SkillGroup
                            key={group.title}
                            title={group.title}
                            items={group.items}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
