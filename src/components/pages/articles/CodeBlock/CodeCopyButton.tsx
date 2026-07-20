'use client';

import CheckIcon from '@/components/icons/check';
import CopyIcon from '@/components/icons/copy';
import { useCopyToClipboard } from '@/components/pages/articles/hooks/useCopyToClipboard';

/** Copy button shown in a code block's header; copies the block's source. */
export default function CodeCopyButton({ code }: { code: string }) {
    const [copied, copy] = useCopyToClipboard();
    return (
        <button
            type="button"
            aria-label={copied ? 'Copied' : 'Copy code'}
            onClick={() => copy(code)}
            className="focus-ring text-foreground/70 hover:bg-foreground/10 hover:text-foreground inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
        >
            {copied ? (
                <>
                    <CheckIcon className="size-3.5 text-emerald-500" />
                    Copied
                </>
            ) : (
                <>
                    <CopyIcon className="size-3.5" />
                    Copy
                </>
            )}
        </button>
    );
}
