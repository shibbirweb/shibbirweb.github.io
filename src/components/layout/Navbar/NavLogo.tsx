'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import ShibbirNavbar from '@/components/icons/shibbir-navbar';
import { lockScrollSync } from '@/components/layout/scrollSyncLock';
import { cn } from '@/utils/cn';

interface NavLogoProps {
    className?: string;
    onNavigate?: () => void;
    /**
     * Collapse the wordmark to just "SHIBBIR" below the lg breakpoint and reveal
     * the full "SHIBBIR AHMED" at lg and up. The desktop bar uses this: the full
     * wordmark would otherwise push the pill wider than the viewport between the
     * md and lg breakpoints (around 768 to 1023px).
     */
    collapsible?: boolean;
    /**
     * Collapsible only: when false the wordmark collapses to zero width and fades
     * out (the desktop bar hides it near the top of the home page so it does not
     * duplicate the hero name, then reveals it once the hero has scrolled away).
     */
    revealed?: boolean;
}

/**
 * Home logo. On the home page it smooth-scrolls back to the top and strips any
 * hash from the URL, so the address bar stays at "/". On other pages it is a
 * plain link home. We scroll in JS instead of linking to "#hero" because Next
 * skips hash scrolling when the target is already partly in view, so a "#hero"
 * link does nothing while the hero is still on screen.
 */
export default function NavLogo({
    className,
    onNavigate,
    collapsible = false,
    revealed = true,
}: NavLogoProps) {
    const pathname = usePathname();

    const scrollToTop = (event: MouseEvent<HTMLAnchorElement>) => {
        onNavigate?.();
        if (pathname !== '/') return;
        event.preventDefault();
        // Hold the URL sync off so the hash clears cleanly to "/" instead of
        // being rewritten to each section the upward glide passes.
        lockScrollSync(1000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.replaceState(
            window.history.state,
            '',
            window.location.pathname + window.location.search
        );
    };

    return (
        <Link
            href="/"
            aria-label="Home"
            onClick={scrollToTop}
            className={cn('focus-ring rounded-sm', className)}
        >
            {collapsible ? (
                // The wordmark (viewBox 588.6 x 82.601) is ~8.91rem wide at h-5;
                // "SHIBBIR" ends near x 316 (~4.8rem). The wrapper clips the SVG
                // and animates its width, so "AHMED" slides in from the right
                // toward the divider when the viewport crosses lg. We use
                // overflow-clip with a 2px clip margin rather than overflow-hidden
                // so the glyphs' 1px non-scaling stroke can render just past the
                // box edge: that keeps the "S" and "D" rounded edges intact while
                // still hiding "AHMED", which sits well beyond the margin.
                <span
                    className={cn(
                        'block h-5 overflow-clip [overflow-clip-margin:2px] transition-[width,opacity] duration-500 ease-out motion-reduce:transition-none',
                        revealed
                            ? 'w-[4.8rem] opacity-100 lg:w-[8.92rem]'
                            : 'w-0 opacity-0'
                    )}
                >
                    <ShibbirNavbar className="block h-5 w-[8.92rem] max-w-none" />
                </span>
            ) : (
                <ShibbirNavbar className="h-5 w-auto" />
            )}
        </Link>
    );
}
