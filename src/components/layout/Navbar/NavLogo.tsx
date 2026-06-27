'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import Shibbir from '@/components/icons/shibbir';

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
}: NavLogoProps) {
    const pathname = usePathname();

    const scrollToTop = (event: MouseEvent<HTMLAnchorElement>) => {
        onNavigate?.();
        if (pathname !== '/') return;
        event.preventDefault();
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
            className={className}
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
                <span className="block h-5 w-[4.8rem] overflow-clip [overflow-clip-margin:2px] transition-[width] duration-500 ease-out motion-reduce:transition-none lg:w-[8.92rem]">
                    <Shibbir className="block h-5 w-[8.92rem] max-w-none" />
                </span>
            ) : (
                <Shibbir className="h-5 w-auto" />
            )}
        </Link>
    );
}
