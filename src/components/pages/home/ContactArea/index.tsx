import SocialIcons from '@/components/pages/home/HeroArea/SocialIcons';
import SectionHeading from '@/components/pages/common/SectionHeading';
import { siteAuthorEmail } from '@/config/constants';

export default function ContactArea() {
    return (
        <section
            id="contact"
            className="py-20 sm:py-28"
        >
            <div className="container mx-auto flex flex-col items-center px-4 text-center">
                <SectionHeading accentClassName="decoration-teal-500">
                    Let&apos;s connect
                </SectionHeading>

                <p className="text-foreground/70 mt-6 max-w-2xl text-2xl leading-normal">
                    Have an idea, a question, or just want to say hi? Reach out
                    over email or find me on any of these platforms.
                </p>

                <a
                    href={`mailto:${siteAuthorEmail}`}
                    className="border-foreground/20 hover:border-foreground/50 mt-10 inline-block rounded-full border px-8 py-3 text-2xl transition-all duration-300 hover:scale-105"
                >
                    {siteAuthorEmail}
                </a>

                <div className="mt-10">
                    <SocialIcons />
                </div>
            </div>
        </section>
    );
}
