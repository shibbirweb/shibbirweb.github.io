interface GlitchWordProps {
    children: string;
    /** CSS Module class that sets the currently active font-family. */
    fontClassName: string;
}

/**
 * A single name word rendered in the currently active face. The real text stays
 * in flow so it remains selectable and the accessible name, and the only thing
 * that ever changes is its font-family (the shiny gradient is inherited from
 * ShinyTextAnimation and untouched). The text-box-* utilities stay a plain
 * string because routing them through cn()/tailwind-merge collapses the pair and
 * drops the trim.
 */
export default function GlitchWord({ children, fontClassName }: GlitchWordProps) {
    return (
        <span
            className={`${fontClassName} text-box-trim-trim-both text-box-edge-cap-alphabetic py-1`}
        >
            {children}
        </span>
    );
}
