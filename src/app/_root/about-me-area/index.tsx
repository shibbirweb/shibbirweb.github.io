import AnimatedUnderline from '@/components/animations/AnimatedUnderline';
import SectionHeading from '@/components/pages/common/SectionHeading';

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
                    {/* eslint-disable-next-line @next/next/no-img-element -- static headshot; no image-optimization server on a GitHub Pages export */}
                    <img
                        src="/shibbir-ahmed.jpg"
                        alt="Portrait of MD. Shibbir Ahmed"
                        width={224}
                        height={224}
                        loading="lazy"
                        decoding="async"
                        className="size-44 shrink-0 self-center rounded-2xl object-cover sm:size-56 sm:self-start"
                    />

                    <div className="text-2xl leading-normal sm:text-justify">
                        <p>
                            I&apos;m <strong>MD. Shibbir Ahmed</strong>, a{' '}
                            <strong>Full Stack Developer</strong> committed to
                            building scalable and maintainable web applications.
                            I specialize in{' '}
                            <AnimatedUnderline
                                variant="draw-right"
                                color="var(--color-yellow-500)"
                                delayMs={0}
                            >
                                JavaScript
                            </AnimatedUnderline>
                            ,{' '}
                            <AnimatedUnderline
                                variant="draw-left"
                                color="var(--color-blue-500)"
                                delayMs={120}
                            >
                                PHP
                            </AnimatedUnderline>
                            , and{' '}
                            <AnimatedUnderline
                                variant="center"
                                color="var(--color-emerald-500)"
                                delayMs={240}
                            >
                                Node.js
                            </AnimatedUnderline>
                            , leveraging{' '}
                            <AnimatedUnderline
                                variant="highlight"
                                color="var(--color-indigo-500)"
                                delayMs={360}
                            >
                                Docker
                            </AnimatedUnderline>{' '}
                            for containerization and implementing{' '}
                            <AnimatedUnderline
                                variant="rise"
                                color="var(--color-red-500)"
                                delayMs={480}
                            >
                                CI/CD
                            </AnimatedUnderline>{' '}
                            pipelines to ensure efficient and reliable
                            deployments. I focus on{' '}
                            <AnimatedUnderline
                                variant="bounce"
                                color="var(--color-orange-500)"
                                delayMs={600}
                            >
                                clean code
                            </AnimatedUnderline>
                            , robust{' '}
                            <AnimatedUnderline
                                variant="glow"
                                color="var(--color-rose-500)"
                                delayMs={720}
                            >
                                system design
                            </AnimatedUnderline>
                            , and delivering solutions that create meaningful
                            impact.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
