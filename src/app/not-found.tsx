import GridBackground from '@/components/backgrounds/GridBackground';
import ButtonLink from '@/components/ui/ButtonLink';
import SectionHeading from '@/components/pages/common/SectionHeading';

// Statically exported to out/404.html, which GitHub Pages serves for any unknown
// path. Echoes the site's hero motif (grid backdrop) and reuses the shared
// button styling so the 404 reads as part of the site.
export default function NotFound() {
    return (
        <main
            id="main"
            className="relative isolate flex grow flex-col items-center justify-center overflow-hidden px-4 py-28 text-center sm:py-36"
        >
            <GridBackground className="opacity-60" />

            <p className="text-foreground/70 text-6xl font-bold sm:text-7xl">
                404
            </p>
            <SectionHeading
                as="h1"
                className="mt-6"
            >
                This page wandered off
            </SectionHeading>
            <p className="text-foreground/70 mt-4 max-w-xl text-lg leading-relaxed text-balance">
                The page you are looking for does not exist, moved, or never did.
                Let&apos;s get you back on track.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <ButtonLink href="/">Back home</ButtonLink>
                <ButtonLink
                    href="/articles"
                    variant="outline"
                >
                    Read articles
                </ButtonLink>
            </div>
        </main>
    );
}
