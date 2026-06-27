import AboutMeArea from './_root/about-me-area';
import ArticlesArea from './_root/articles-area';
import ContactArea from './_root/contact-area';
import FooterArea from './_root/footer-area';
import HeroArea from './_root/hero-area';
import ProjectsArea from './_root/projects-area';
import SkillsArea from './_root/skills-area';

export default function Home() {
    return (
        <main className="home-sections">
            <HeroArea />

            <AboutMeArea />

            <ProjectsArea />

            <SkillsArea />

            <ArticlesArea />

            <ContactArea />

            <FooterArea />
        </main>
    );
}
