import type { CSSProperties } from 'react';

/**
 * Exposes an article's two cover-accent colours as the `--accent-from` /
 * `--accent-to` custom properties, so themed article UI (reading bar, TOC,
 * series tracker, "what you'll learn") can pick up the page's colour identity
 * with a single `style={accentStyle(article.coverColors)}`.
 */
export function accentStyle(
    accentColors: readonly [string, string]
): CSSProperties {
    return {
        '--accent-from': accentColors[0],
        '--accent-to': accentColors[1],
    } as CSSProperties;
}
