import SocialIcons from '@/components/pages/home/HeroArea/SocialIcons';
import SectionHeading from '@/components/pages/common/SectionHeading';
import ContactForm from '@/components/pages/home/ContactArea/ContactForm';
import {
    contactHeading,
    contactIntro,
} from '@/components/pages/home/ContactArea/contents';

export default function ContactArea() {
    return (
        <section
            id="contact"
            className="py-20 sm:py-28"
        >
            <div className="container mx-auto flex flex-col items-center px-4 text-center">
                <SectionHeading>{contactHeading}</SectionHeading>

                <p className="text-foreground/70 mt-4 max-w-2xl text-lg leading-relaxed">
                    {contactIntro}
                </p>

                <ContactForm />

                <div className="mt-14">
                    <SocialIcons />
                </div>
            </div>
        </section>
    );
}
