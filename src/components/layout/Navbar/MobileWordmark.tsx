import { cn } from '@/utils/cn';
import NavLogo from './NavLogo';

interface MobileWordmarkProps {
    /** Reveal the wordmark at the top of the screen; otherwise hide it. */
    revealed: boolean;
    onNavigate: () => void;
}

/**
 * The "SHIBBIR AHMED" wordmark centered along the top of inner pages, in a glass
 * pill matching the menu button. It is fixed to the viewport so `left-1/2
 * -translate-x-1/2` keeps it centered; when hidden it fades, scales down, and
 * drifts up slightly so it reads as tucking away on scroll. The `-translate-x-1/2`
 * stays in the base classes so it remains centered throughout the transition.
 *
 * Must be rendered outside any transformed ancestor: a non-`none` transform on a
 * parent would become the containing block for this `fixed` element and shift it
 * off-center (see the placement note in MobileNav).
 */
export default function MobileWordmark({
    revealed,
    onNavigate,
}: MobileWordmarkProps) {
    return (
        <NavLogo
            onNavigate={onNavigate}
            className={cn(
                'border-foreground/10 bg-background/60 text-foreground/80 hover:text-foreground fixed top-4 left-1/2 z-50 flex h-11 -translate-x-1/2 items-center rounded-full border px-4 shadow-lg shadow-black/5 backdrop-blur-lg transition-all duration-500 ease-out motion-reduce:transition-none md:hidden',
                revealed
                    ? 'visible translate-y-0 scale-100 opacity-100'
                    : 'pointer-events-none invisible -translate-y-1 scale-95 opacity-0'
            )}
        />
    );
}
