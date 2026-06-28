import AboutMeArea from '@/components/pages/home/AboutMeArea';
// import ArticlesArea from '@/components/pages/home/ArticlesArea';
import ContactArea from '@/components/pages/home/ContactArea';
import HeroArea from '@/components/pages/home/HeroArea';
import ProjectsArea from '@/components/pages/home/ProjectsArea';
import SkillsArea from '@/components/pages/home/SkillsArea';

export default function Home() {
    return (
        <main className="home-sections">
            <HeroArea />

            <AboutMeArea />

            <ProjectsArea />

            <SkillsArea />

            {/* <ArticlesArea /> */}

            <ContactArea />
        </main>
    );
}
