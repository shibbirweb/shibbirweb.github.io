import SocialIcons from '@/components/pages/home/HeroArea/SocialIcons';
import ContactForm from '@/components/pages/home/ContactArea/ContactForm';

export default function ContactArea() {
    return (
        <section
            id="contact"
            className="py-20 sm:py-28"
        >
            <div className="container mx-auto flex flex-col items-center px-4 text-center">
                <ContactForm />

                <div className="mt-16">
                    <SocialIcons />
                </div>
            </div>
        </section>
    );
}
