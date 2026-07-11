import Link from 'next/link';
import SectionHeading from '@/components/pages/common/SectionHeading';

// Statically exported to out/404.html, which GitHub Pages serves for any unknown
// path. Kept thin, reusing the shared heading and the site's CTA link styling.
export default function NotFound() {
    return (
        <main className="container mx-auto flex flex-col items-center px-4 py-28 text-center sm:py-36">
            <p className="text-foreground/50 text-6xl font-bold sm:text-7xl">
                404
            </p>
            <SectionHeading
                as="h1"
                className="mt-6"
            >
                This page wandered off
            </SectionHeading>
            <p className="text-foreground/70 mt-4 max-w-xl text-lg leading-relaxed">
                The page you are looking for does not exist, moved, or never did.
                Let&apos;s get you back on track.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                    href="/"
                    className="border-foreground/20 hover:border-foreground/50 inline-block rounded-full border px-6 py-3 text-base transition-all duration-300 hover:scale-105"
                >
                    Back home
                </Link>
                <Link
                    href="/articles"
                    className="border-foreground/20 hover:border-foreground/50 inline-block rounded-full border px-6 py-3 text-base transition-all duration-300 hover:scale-105"
                >
                    Read articles
                </Link>
            </div>
        </main>
    );
}
