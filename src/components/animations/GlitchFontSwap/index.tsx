'use client';

import GlitchWord from '@/components/animations/GlitchFontSwap/GlitchWord';
import {
    useGlitchFontSwap,
    type FontPhase,
} from '@/components/animations/GlitchFontSwap/hooks/useGlitchFontSwap';
import styles from '@/components/animations/GlitchFontSwap/GlitchFontSwap.module.css';

/** Maps the active font phase to the CSS Module class that applies its face. */
const fontClassName: Record<FontPhase, string> = {
    display: styles.fontDisplay,
    sans: styles.fontSans,
};

interface GlitchFontSwapProps {
    /** The name words, each rendered as a separate, selectable, readable span. */
    words: string[];
}

/**
 * Renders the hero name words and, once mounted (and only when motion is
 * allowed), periodically plays a brief glitch that flickers the name's font and
 * settles on the next face, holding it until the next glitch (Zain -> Noto Sans
 * -> Zain). Only the font-family changes, so the existing shiny gradient is
 * preserved. The words are returned as a fragment so they stay direct flex
 * children of the hero h1, leaving its flex-wrap layout intact. Under reduced
 * motion the name stays static in the display font (Zain).
 */
export default function GlitchFontSwap({ words }: GlitchFontSwapProps) {
    const { fontPhase } = useGlitchFontSwap();

    return (
        <>
            {words.map((word) => (
                <GlitchWord key={word} fontClassName={fontClassName[fontPhase]}>
                    {word}
                </GlitchWord>
            ))}
        </>
    );
}
