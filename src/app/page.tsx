import AboutMeArea from './_root/about-me-area';
import FooterArea from './_root/footer-area';
import HeroArea from './_root/hero-area';

export default function Home() {
    return (
        <section>
            <HeroArea />

            <AboutMeArea />

            <FooterArea />
        </section>
    );
}
