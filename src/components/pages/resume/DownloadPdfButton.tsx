'use client';

import { cn } from '@/utils/cn';

/**
 * Opens the browser print dialog (Save as PDF). The print stylesheet on the
 * resume page restyles the document into a clean light single column, so the
 * saved PDF matches the on-page content minus the site chrome.
 */
export default function DownloadPdfButton({
    className,
}: {
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className={cn(
                'border-foreground/15 text-foreground/80 hover:border-foreground/30 hover:text-foreground inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                className
            )}
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
            </svg>
            Download PDF
        </button>
    );
}
