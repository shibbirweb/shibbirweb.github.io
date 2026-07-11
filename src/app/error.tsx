'use client';

import Link from 'next/link';
import SectionHeading from '@/components/pages/common/SectionHeading';

// Client error boundary for runtime render errors on the exported site. Kept
// thin, reusing the shared heading and the site's CTA link/button styling.
export default function Error({ reset }: { error: Error; reset: () => void }) {
    return (
        <main className="container mx-auto flex flex-col items-center px-4 py-28 text-center sm:py-36">
            <SectionHeading as="h1">Something went wrong</SectionHeading>
            <p className="text-foreground/70 mt-4 max-w-xl text-lg leading-relaxed">
                An unexpected error interrupted this page. You can try again, or
                head back home.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <button
                    type="button"
                    onClick={reset}
                    className="border-foreground/20 hover:border-foreground/50 inline-block rounded-full border px-6 py-3 text-base transition-all duration-300 hover:scale-105"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="border-foreground/20 hover:border-foreground/50 inline-block rounded-full border px-6 py-3 text-base transition-all duration-300 hover:scale-105"
                >
                    Back home
                </Link>
            </div>
        </main>
    );
}
