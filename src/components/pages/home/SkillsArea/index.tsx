import SectionHeading from '@/components/pages/common/SectionHeading';
import SpotlightList from '@/components/pages/common/SpotlightList';
import SkillCard from '@/components/pages/home/SkillsArea/SkillCard';
import { skills } from '@/components/pages/home/SkillsArea/contents';

export default function SkillsArea() {
    return (
        <section
            id="skills"
            className="py-20 sm:py-28"
        >
            <div className="container mx-auto px-4">
                <SectionHeading className="text-center">
                    Skills &amp; Tech
                </SectionHeading>

                <SpotlightList className="mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
                    {skills.map((skill) => (
                        <SkillCard
                            key={skill.name}
                            skill={skill}
                        />
                    ))}
                </SpotlightList>
            </div>
        </section>
    );
}
