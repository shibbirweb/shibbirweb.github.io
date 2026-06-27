import { useEffect, useState } from 'react';

/**
 * Whether the navbar should be shown. On the home page it stays hidden until
 * the hero element (`heroId`) is scrolled roughly halfway out of view, then
 * appears; on every other page it is always visible.
 */
export function useNavbarVisibility(isHome: boolean, heroId: string): boolean {
    const [visible, setVisible] = useState(!isHome);

    useEffect(() => {
        if (!isHome) {
            setVisible(true);
            return;
        }
        const hero = document.getElementById(heroId);
        if (!hero) {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(!entry.isIntersecting),
            // Shrink the root to the bottom half of the viewport so the hero
            // "leaves" — and the navbar appears — once it is scrolled ~50% out.
            { rootMargin: '-50% 0px 0px 0px' }
        );
        observer.observe(hero);
        return () => observer.disconnect();
    }, [isHome, heroId]);

    return visible;
}
