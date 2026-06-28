import { cn } from '@/utils/cn';
import NavLogo from './NavLogo';
import { useRecentlyChanged } from './hooks/useRecentlyChanged';
import { useScrollY } from './hooks/useScrollY';

interface MobileWordmarkProps {
    /** Menu open: travel into the panel's logo slot. Closed: rest at / ride away from the top. */
    open: boolean;
    onNavigate: () => void;
}

/*
 * SLOT lands the box top-left on the panel's first row, from the menu geometry,
 * so it needs no measurement:
 *   content-left = 100vw - right-4(16) - w-56(224) + p-2(8) = 100vw - 232px
 *     -> translateX = (100vw - 232) - 50vw = 50vw - 232px
 *   content-top  = top-4(16) + button h-11(44) + mt-2(8) + p-2(8) = 76px
 *     -> translateY = 76 - 16 = 60px
 * Keep in sync with MobileNav (container) and MobileMenuPanel (panel/slot).
 */
const SLOT_TRANSFORM = 'translate(calc(50vw - 232px), 60px)';
const TRAVEL_EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]';
// How far (px) the wordmark rides the scroll up before it is parked off-screen.
const SCROLL_AWAY = 80;
const TRAVEL_MS = 540;

/**
 * Inner pages only (home keeps a static logo inside the panel): one "SHIBBIR
 * AHMED" wordmark shared between the top-of-page brand and the menu panel's logo.
 * While the menu is closed it sits centered at the top and rides the scroll
 * straight up off the page like an ordinary element (no fixed-in-place fade).
 * When the menu opens it travels from wherever it is into the panel's logo slot,
 * and back out on close: one element, one `transform`, so the trip is a smooth
 * GPU transition. The glass pill fades out as it enters the panel (the panel is
 * its container there) and back in at center.
 *
 * The transition is enabled only around an open/close (`animating`, from
 * useRecentlyChanged); during plain scrolling it is off, so the scroll-follow
 * stays pinned to the scroll position instead of lagging behind it by the travel
 * duration.
 *
 * Must be rendered outside any transformed ancestor: a non-`none` transform on a
 * parent would become the containing block for this `fixed` element and break the
 * vw-based centering and slot maths.
 */
export default function MobileWordmark({
    open,
    onNavigate,
}: MobileWordmarkProps) {
    const scrollY = useScrollY();
    const animating = useRecentlyChanged(open, TRAVEL_MS);

    const offset = Math.min(scrollY, SCROLL_AWAY);
    const transform = open ? SLOT_TRANSFORM : `translate(-50%, ${-offset}px)`;
    // Visible centered at the top until it has ridden away, or any time the menu is open.
    const shown = open || scrollY < SCROLL_AWAY;

    return (
        <div
            className={cn(
                'fixed top-4 left-1/2 z-50 h-11 md:hidden',
                animating
                    ? cn(
                          'transition-[transform,opacity,visibility] duration-500 motion-reduce:transition-none',
                          TRAVEL_EASE
                      )
                    : 'transition-none',
                shown
                    ? 'visible opacity-100'
                    : 'pointer-events-none invisible opacity-0'
            )}
            style={{ transform }}
        >
            <div
                aria-hidden="true"
                className={cn(
                    'border-foreground/10 bg-background/60 absolute inset-0 rounded-full border shadow-lg shadow-black/5 backdrop-blur-lg transition-opacity duration-500 motion-reduce:transition-none',
                    TRAVEL_EASE,
                    open ? 'opacity-0' : 'opacity-100'
                )}
            />
            <NavLogo
                onNavigate={onNavigate}
                className="text-foreground/80 hover:text-foreground relative flex h-full items-center px-4 transition-colors"
            />
        </div>
    );
}
