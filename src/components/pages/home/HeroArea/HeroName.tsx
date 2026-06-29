interface HeroNameProps {
    /** The name words, each rendered as a separate, selectable, readable span. */
    words: string[];
}

/**
 * Renders the hero name words in the display font (Zain), inherited from the
 * hero wrapper's `font-display` class. The words are returned as a fragment so
 * they stay direct flex children of the hero h1, leaving its flex-wrap layout
 * intact, and the shiny gradient from ShinyTextAnimation is inherited untouched.
 * The text-box-* utilities stay a plain string because routing them through
 * cn()/tailwind-merge collapses the pair and drops the trim.
 */
export default function HeroName({ words }: HeroNameProps) {
    return (
        <>
            {words.map((word) => (
                <span
                    key={word}
                    className="text-box-trim-trim-both text-box-edge-cap-alphabetic py-1"
                >
                    {word}
                </span>
            ))}
        </>
    );
}
