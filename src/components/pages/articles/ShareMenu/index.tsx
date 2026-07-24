'use client';

import { useRef } from 'react';
import { accentStyle } from '@/utils/accentStyle';
import { cn } from '@/utils/cn';
import CheckIcon from '@/components/icons/check';
import CopyIcon from '@/components/icons/copy';
import ShareIcon from '@/components/icons/share';
import { shareTargets } from '@/components/pages/articles/ShareMenu/contents';
import ShareMenuItem from '@/components/pages/articles/ShareMenu/ShareMenuItem';
import { useShareMenu } from '@/components/pages/articles/ShareMenu/hooks/useShareMenu';
import { useCopyToClipboard } from '@/components/pages/articles/hooks/useCopyToClipboard';
import styles from '@/components/pages/articles/ShareMenu/ShareMenu.module.css';

/**
 * A single "Share" button that opens a popover of share destinations for the
 * article: the platforms in `shareTargets`, a Copy link action, and (only where
 * the Web Share API exists) the native OS share sheet. The trigger wears the
 * signature accent bloom, tinted with the article's cover colour. Client-only,
 * so `ArticleView` can stay a server component and just place it.
 */
export default function ShareMenu({
    title,
    description,
    accentColors,
    label = 'Share',
    align = 'left',
    className,
}: {
    title: string;
    description?: string;
    accentColors?: readonly [string, string];
    label?: string;
    align?: 'left' | 'right';
    className?: string;
}) {
    const menuRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const {
        open,
        toggle,
        close,
        placement,
        pageUrl,
        canNativeShare,
        shareNative,
    } = useShareMenu({
        menuRef,
        panelRef,
        title,
        description,
    });
    const [copied, copy] = useCopyToClipboard();

    const menuRowClassName =
        'focus-ring text-foreground/70 hover:text-foreground hover:bg-foreground/5 flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors';

    const panelOriginClass = cn(
        placement === 'bottom' && align === 'left' && 'origin-top-left',
        placement === 'bottom' && align === 'right' && 'origin-top-right',
        placement === 'top' && align === 'left' && 'origin-bottom-left',
        placement === 'top' && align === 'right' && 'origin-bottom-right'
    );

    return (
        <div
            ref={menuRef}
            className={cn('relative inline-block', className)}
            style={accentColors ? accentStyle(accentColors) : undefined}
        >
            <button
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Share this article"
                title="Share"
                className={cn(
                    styles.trigger,
                    'focus-ring border-foreground/15 text-foreground/80 hover:text-foreground relative isolate inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors'
                )}
            >
                <ShareIcon
                    aria-hidden="true"
                    className="size-4"
                />
                {label}
            </button>

            <div
                className={cn(
                    'absolute z-30',
                    align === 'right' ? 'right-0' : 'left-0',
                    placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
                    open ? '' : 'pointer-events-none'
                )}
            >
                <div
                    ref={panelRef}
                    role="menu"
                    aria-label="Share this article"
                    className={cn(
                        'border-foreground/10 bg-background/80 w-56 rounded-2xl border p-2 shadow-xl shadow-black/10 backdrop-blur-lg transition-all duration-200 ease-out',
                        panelOriginClass,
                        open
                            ? 'visible scale-100 opacity-100'
                            : 'invisible scale-95 opacity-0'
                    )}
                >
                    <ul className="flex flex-col gap-0.5">
                        {canNativeShare && (
                            <li role="none">
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        shareNative();
                                        close();
                                    }}
                                    className={menuRowClassName}
                                >
                                    <ShareIcon
                                        aria-hidden="true"
                                        className="size-4 shrink-0"
                                    />
                                    Share via...
                                </button>
                            </li>
                        )}
                        {shareTargets.map((target) => (
                            <ShareMenuItem
                                key={target.name}
                                target={target}
                                url={pageUrl}
                                title={title}
                                onSelect={close}
                            />
                        ))}
                        <li
                            role="separator"
                            className="bg-foreground/10 mx-2 my-1 h-px"
                        />
                        <li role="none">
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => copy(pageUrl)}
                                aria-label={copied ? 'Link copied' : 'Copy link'}
                                className={menuRowClassName}
                            >
                                {copied ? (
                                    <>
                                        <CheckIcon
                                            aria-hidden="true"
                                            className="size-4 shrink-0 text-emerald-500"
                                        />
                                        Link copied
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon
                                            aria-hidden="true"
                                            className="size-4 shrink-0"
                                        />
                                        Copy link
                                    </>
                                )}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
