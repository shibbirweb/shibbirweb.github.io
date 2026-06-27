import ExportedImage from 'next-image-export-optimizer';
import AnimatedUnderline from '@/components/animations/AnimatedUnderline';
import SectionHeading from '@/components/pages/common/SectionHeading';
import { careerExperience } from '@/config/constants';

export default function AboutMeArea() {
    return (
        <section
            id="about"
            className="relative bg-gradient-to-b from-[var(--background)] to-[var(--background)] to-100% dark:via-[#0d1116]"
        >
            <div className="container mx-auto flex min-h-svh flex-col justify-center gap-12 px-4 py-20 sm:py-28">
                <SectionHeading accentClassName="decoration-indigo-500">
                    About me
                </SectionHeading>

                <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:gap-14">
                    <ExportedImage
                        src="images/shibbir-ahmed.jpg"
                        alt="Portrait of MD. Shibbir Ahmed"
                        width={224}
                        height={224}
                        className="size-44 shrink-0 self-center rounded-2xl object-cover sm:size-56 sm:self-start"
                    />

                    <div className="space-y-6 text-2xl leading-normal sm:text-justify">
                        <p>
                            I&apos;m <strong>MD. Shibbir Ahmed</strong>, a{' '}
                            <strong>Senior Full-Stack Software Engineer</strong>{' '}
                            with {careerExperience}+ years building scalable web
                            applications and the backend systems behind them.
                            I&apos;ve shipped across healthcare, e-commerce, and
                            the public sector — designing{' '}
                            <AnimatedUnderline
                                variant="draw-right"
                                color="var(--color-blue-500)"
                                delayMs={0}
                            >
                                REST APIs
                            </AnimatedUnderline>
                            , architecting backend services, optimizing
                            databases, and shipping to production with{' '}
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
                            More recently I&apos;ve focused on{' '}
                            <AnimatedUnderline
                                variant="center"
                                color="var(--color-emerald-500)"
                                delayMs={360}
                            >
                                AI engineering
                            </AnimatedUnderline>{' '}
                            — building applications on{' '}
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
                            , preferring to understand how these systems work
                            over simply calling their APIs. Outside of work I
                            run my own{' '}
                            <AnimatedUnderline
                                variant="glow"
                                color="var(--color-rose-500)"
                                delayMs={720}
                            >
                                self-hosted infrastructure
                            </AnimatedUnderline>{' '}
                            on Proxmox and Docker — staying close to networking,
                            automation, and what it takes to keep software
                            running.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
