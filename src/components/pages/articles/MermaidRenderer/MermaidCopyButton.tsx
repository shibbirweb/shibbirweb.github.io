'use client';

import CheckIcon from '@/components/icons/check';
import CopyIcon from '@/components/icons/copy';
import MermaidIconButton from '@/components/pages/articles/MermaidRenderer/MermaidIconButton';
import { useCopyToClipboard } from '@/components/pages/articles/hooks/useCopyToClipboard';
import { cn } from '@/utils/cn';

/**
 * Copies a diagram's Mermaid source. On success it shows a green checkmark and a
 * small "Copied" popup for a couple of seconds.
 */
export default function MermaidCopyButton({
    source,
    className,
}: {
    source: string;
    className?: string;
}) {
    const [copied, copy] = useCopyToClipboard();
    return (
        <div className={cn('relative', className)}>
            <MermaidIconButton
                aria-label={copied ? 'Copied' : 'Copy diagram source'}
                onClick={() => copy(source)}
            >
                {copied ? (
                    <CheckIcon className="size-4 text-emerald-500" />
                ) : (
                    <CopyIcon className="size-4" />
                )}
            </MermaidIconButton>
            {copied && (
                <span
                    role="status"
                    className="border-foreground/10 bg-background text-foreground absolute top-full right-0 z-20 mt-1 rounded-md border px-2 py-1 text-xs whitespace-nowrap shadow-sm"
                >
                    Copied
                </span>
            )}
        </div>
    );
}
