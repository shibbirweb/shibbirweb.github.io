import Bento from '@/components/pages/home/AboutMeArea/Bento';
import SystemDiagram from '@/components/pages/home/AboutMeArea/SystemDiagram';
import SectionHeading from '@/components/pages/common/SectionHeading';

export default function AboutMeArea() {
    return (
        <section
            id="about"
            className="relative"
        >
            <div className="container mx-auto flex min-h-svh flex-col justify-center gap-12 px-4 py-20 sm:py-28">
                <div className="space-y-3 text-center">
                    <SectionHeading>About me</SectionHeading>
                    <p className="text-foreground/60 mx-auto max-w-xl">
                        A few things that shape how I build.
                    </p>
                </div>

                <SystemDiagram />
                <Bento />
            </div>
        </section>
    );
}
