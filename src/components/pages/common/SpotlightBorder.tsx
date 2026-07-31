import { cn } from '@/utils/cn';

/**
 * The lit edge of a surface's cursor spotlight: a hairline ring that the caller's
 * CSS module tints and masks to a soft circle at the pointer, so only the stretch
 * of border nearest the cursor brightens. It needs a real element rather than a
 * pseudo-element because the spotlit surfaces already spend ::before on their
 * ambient accent bloom and ::after on the spotlight's inner glow.
 *
 * Rendered last inside the surface and left at the default z-index so it paints
 * over the content, which occludes nothing: the background stays transparent, so
 * only the one-pixel perimeter ever draws. -inset-px (not inset-0) puts the ring
 * on the surface's border rather than a pixel inside it, since an absolutely
 * positioned child is placed against the padding box.
 *
 * The radius is inherited rather than restated: border-radius describes the outer
 * border edge, and -inset-px is exactly that edge, so the surface's own value is
 * already the correct curve and the ring tracks it if the surface's rounding ever
 * changes. A surface that clips to its padding box (overflow-hidden) would swallow
 * the ring entirely, so those move the clip inward instead.
 *
 * `className` carries the caller's module class: the tint and the pointer mask.
 */
export default function SpotlightBorder({ className }: { className: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                'pointer-events-none absolute -inset-px rounded-[inherit] border',
                className
            )}
        />
    );
}
