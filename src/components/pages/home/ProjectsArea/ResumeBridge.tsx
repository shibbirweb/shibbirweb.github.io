import ChevronIcon from '@/components/icons/chevron';
import ButtonLink from '@/components/ui/ButtonLink';

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
            <ButtonLink
                href="/resume"
                variant="outline"
                className="group mt-4 rounded-full"
            >
                View resume
                <ChevronIcon
                    aria-hidden="true"
                    className="size-4 rotate-90 transition-transform group-hover:translate-x-0.5"
                />
            </ButtonLink>
        </div>
    );
}
