'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import Shibbir from '@/components/icons/shibbir';

interface NavLogoProps {
    className?: string;
    onNavigate?: () => void;
}

/**
 * Home logo. On the home page it smooth-scrolls back to the top and strips any
 * hash from the URL, so the address bar stays at "/". On other pages it is a
 * plain link home. We scroll in JS instead of linking to "#hero" because Next
 * skips hash scrolling when the target is already partly in view, so a "#hero"
 * link does nothing while the hero is still on screen.
 */
export default function NavLogo({ className, onNavigate }: NavLogoProps) {
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
            <Shibbir className="h-5 w-auto" />
        </Link>
    );
}
