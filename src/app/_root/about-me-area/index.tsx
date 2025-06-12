export default function AboutMeArea() {
    return (
        <div className="relative flex min-h-[120svh] bg-gradient-to-b from-[var(--background)] to-[var(--background)] to-100% dark:via-[#0d1116]">
            <div className="container mx-auto flex grow flex-col items-center justify-center px-4">
                <div className="leading-normal sm:text-justify">
                    <p>
                        I&apos;m <strong>MD. Shibbir Ahmed</strong>, a{' '}
                        <strong>Full Stack Developer</strong> committed to
                        building scalable and maintainable web applications. I
                        specialize in{' '}
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
                        pipelines to ensure efficient and reliable deployments.
                        I focus on{' '}
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
                    <p className="mt-2">
                        Coding is not merely my profession, but a dedicated
                        pursuit through which I continuously seek to advance
                        technology and drive innovation.
                    </p>
                </div>
            </div>
        </div>
    );
}
