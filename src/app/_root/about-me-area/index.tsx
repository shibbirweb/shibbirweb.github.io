import SectionHeading from '@/components/pages/common/SectionHeading';
import {
    careerExperience,
    currentJobTitle,
    currentWorkplace,
    currentWorkplaceURL,
    education,
    educationURL,
} from '@/config/constants';

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
                            <strong className="underline decoration-yellow-500">
                                JavaScript
                            </strong>
                            ,{' '}
                            <strong className="underline decoration-blue-500">
                                PHP
                            </strong>
                            , and{' '}
                            <strong className="underline decoration-emerald-500">
                                Node.js
                            </strong>
                            , leveraging{' '}
                            <strong className="underline decoration-indigo-500">
                                Docker
                            </strong>{' '}
                            for containerization and implementing{' '}
                            <strong className="underline decoration-red-500">
                                CI/CD
                            </strong>{' '}
                            pipelines to ensure efficient and reliable
                            deployments. I focus on{' '}
                            <strong className="underline decoration-orange-500">
                                clean code
                            </strong>
                            , robust{' '}
                            <strong className="underline decoration-rose-500">
                                system design
                            </strong>
                            , and delivering solutions that create meaningful
                            impact.
                        </p>
                        <p className="mt-4">
                            Coding is not merely my profession, but a dedicated
                            pursuit through which I continuously seek to advance
                            technology and drive innovation.
                        </p>
                        <p className="mt-6 text-foreground/70">
                            Currently a {currentJobTitle} at{' '}
                            <a
                                href={currentWorkplaceURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-emerald-500 underline-offset-4"
                            >
                                {currentWorkplace}
                            </a>{' '}
                            with {careerExperience}+ years of experience.{' '}
                            <a
                                href={educationURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-blue-500 underline-offset-4"
                            >
                                {education}
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
