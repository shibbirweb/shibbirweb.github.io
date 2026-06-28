import ExportedImage from 'next-image-export-optimizer';
import AnimatedUnderline from '@/components/animations/AnimatedUnderline';
import SectionHeading from '@/components/pages/common/SectionHeading';
import { careerExperience } from '@/config/constants';

export default function AboutMeArea() {
    return (
        <section
            id="about"
            className="relative"
        >
            <div className="container mx-auto flex min-h-svh flex-col justify-center gap-12 px-4 py-20 sm:py-28">
                <SectionHeading className="text-center">
                    About me
                </SectionHeading>

                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
                    <ExportedImage
                        src="images/shibbir-ahmed.jpg"
                        alt="Portrait of MD. Shibbir Ahmed"
                        width={224}
                        height={224}
                        className="size-44 shrink-0 self-center rounded-2xl object-cover sm:size-56 lg:self-start"
                    />

                    <div className="space-y-5 text-lg leading-relaxed sm:text-justify">
                        <p>
                            I&apos;m <strong>MD. Shibbir Ahmed</strong>, a{' '}
                            <strong>Senior Full-Stack Software Engineer</strong>{' '}
                            with {careerExperience}+ years building scalable web
                            apps and the systems behind them across healthcare,
                            e-commerce, and the public sector. I design{' '}
                            <AnimatedUnderline
                                variant="draw-right"
                                color="var(--color-blue-500)"
                                delayMs={0}
                            >
                                REST APIs
                            </AnimatedUnderline>
                            , architect backend services, and ship with{' '}
                            <AnimatedUnderline
                                variant="highlight"
                                color="var(--color-indigo-500)"
                                delayMs={120}
                            >
                                Docker
                            </AnimatedUnderline>{' '}
                            and{' '}
                            <AnimatedUnderline
                                variant="rise"
                                color="var(--color-red-500)"
                                delayMs={240}
                            >
                                CI/CD
                            </AnimatedUnderline>
                            .
                        </p>
                        <p>
                            Lately I&apos;ve focused on{' '}
                            <AnimatedUnderline
                                variant="center"
                                color="var(--color-emerald-500)"
                                delayMs={360}
                            >
                                AI engineering
                            </AnimatedUnderline>
                            :{' '}
                            <AnimatedUnderline
                                variant="draw-left"
                                color="var(--color-yellow-500)"
                                delayMs={480}
                            >
                                LLMs
                            </AnimatedUnderline>
                            , RAG, embeddings, and{' '}
                            <AnimatedUnderline
                                variant="bounce"
                                color="var(--color-orange-500)"
                                delayMs={600}
                            >
                                vector search
                            </AnimatedUnderline>
                            . I prefer to understand how these systems work over
                            simply calling their APIs. Outside work, I run my
                            own{' '}
                            <AnimatedUnderline
                                variant="glow"
                                color="var(--color-rose-500)"
                                delayMs={720}
                            >
                                self-hosted infrastructure
                            </AnimatedUnderline>{' '}
                            on Proxmox and Docker.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
