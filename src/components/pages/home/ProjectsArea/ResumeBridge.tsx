import Link from 'next/link';
import ChevronIcon from '@/components/icons/chevron';

/**
 * In-context pointer from the open-source grid to the resume, where the
 * professional, client-facing work lives in full. Keeps the home Projects
 * section honest about scope without duplicating that work here.
 */
export default function ResumeBridge() {
    return (
        <div className="mt-14 text-center">
            <p className="text-foreground/70">
                My professional, client-facing work lives on the resume.
            </p>
            <Link
                href="/resume"
                className="group text-foreground decoration-foreground/30 hover:decoration-foreground mt-3 inline-flex items-center gap-1.5 font-medium underline underline-offset-4 transition-colors"
            >
                View resume
                <ChevronIcon
                    aria-hidden="true"
                    className="size-4 rotate-90 transition-transform group-hover:translate-x-0.5"
                />
            </Link>
        </div>
    );
}
