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
            className="text-foreground/55 hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors"
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
