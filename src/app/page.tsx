import AboutMeArea from '@/components/pages/home/AboutMeArea';
import ArticlesArea from '@/components/pages/home/ArticlesArea';
import ContactArea from '@/components/pages/home/ContactArea';
import HeroArea from '@/components/pages/home/HeroArea';
import ProjectsArea from '@/components/pages/home/ProjectsArea';
import SkillsArea from '@/components/pages/home/SkillsArea';
import SectionUrlSync from '@/components/layout/SectionUrlSync';
import { JsonLd } from '@/components/seo/JsonLd';
import { sendMockJsonLd } from '@/utils/sendMockJsonLd';

export default function Home() {
    return (
        <main
            id="main"
            className="home-sections"
        >
            {process.env.NODE_ENV === 'production' && (
                <JsonLd data={sendMockJsonLd} />
            )}
            <SectionUrlSync />

            <HeroArea />

            <AboutMeArea />

            <SkillsArea />

            <ProjectsArea />

            <ArticlesArea />

            <ContactArea />
        </main>
    );
}
