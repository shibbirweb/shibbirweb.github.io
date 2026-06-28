'use client';

import DownIcon from '@/components/icons/down';
import { heroId } from '@/components/layout/Navbar/contents';
import { useNavbarVisibility } from '@/components/layout/Navbar/hooks/useNavbarVisibility';
import { cn } from '@/utils/cn';

/**
 * Down-arrow scroll cue at the bottom of the hero. It is the inverse of the
 * navbar and shares the same visibility signal: shown while the navbar is still
 * hidden (user near the top of the page) and hidden once the navbar appears
 * (hero scrolled ~halfway out of view).
 */
export default function ScrollDownCue() {
    const navbarVisible = useNavbarVisibility(true, heroId);

    return (
        <a
            href="#about"
            aria-label="Scroll to the about section"
            className={cn(
                'text-foreground/40 hover:text-foreground/70 mb-6 transition-all duration-500 ease-out motion-reduce:transition-none motion-safe:animate-bounce sm:mb-10',
                navbarVisible
                    ? 'pointer-events-none invisible opacity-0'
                    : 'visible opacity-100'
            )}
        >
            <DownIcon
                className="size-8"
                aria-hidden="true"
            />
        </a>
    );
}
