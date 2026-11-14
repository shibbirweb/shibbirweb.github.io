import SectionHeading from '@/components/pages/common/SectionHeading';
import AiShowcase from '@/components/pages/home/SkillsArea/AiShowcase';
import SkillIconsRegion from '@/components/pages/home/SkillsArea/SkillIconsRegion';
import StackOverview from '@/components/pages/home/SkillsArea/StackOverview';
import { skillsIntro } from '@/components/pages/home/SkillsArea/contents';

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
                <p className="text-foreground/70 mx-auto mt-4 max-w-2xl text-center text-base sm:text-lg">
                    {skillsIntro}
                </p>

                <SkillIconsRegion className="mx-auto mt-12 max-w-6xl">
                    <AiShowcase />
                    <StackOverview />
                </SkillIconsRegion>
            </div>
        </section>
    );
}
