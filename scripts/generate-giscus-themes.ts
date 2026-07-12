// Build-time generation of the giscus comment theme. Reads the site palette
// tokens from src/app/globals.css (the single source of truth) and writes
// public/giscus-light.css and public/giscus-dark.css, so the comment theme stays
// in sync with the site colors and never drifts. Runs before `next dev`/`next
// build` (see package.json); the two output files are gitignored and regenerated.
//
// giscus loads the theme as a crossorigin stylesheet inside its public https
// iframe, so it only renders from a public URL (the deployed https://shibbir.me),
// not over localhost.

import fs from 'node:fs';
import path from 'node:path';

type Mode = 'light' | 'dark';

interface Palette {
    background: string;
    foreground: string;
}

const GLOBALS = path.join(process.cwd(), 'src/app/globals.css');
const PUBLIC = path.join(process.cwd(), 'public');

/** Pull a `--name: #hex;` token out of a CSS rule block, or throw if missing. */
function token(block: string, name: string): string {
    const match = block.match(
        new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`)
    );
    if (!match) {
        throw new Error(
            `generate-giscus-themes: --${name} not found in globals.css palette block`
        );
    }
    return match[1];
}

/** The CSS block for a selector, so tokens resolve from the right theme. */
function block(css: string, selectorRegex: RegExp): string {
    const match = css.match(selectorRegex);
    if (!match) {
        throw new Error(
            `generate-giscus-themes: palette block ${selectorRegex} not found in globals.css`
        );
    }
    return match[1];
}

function readPalettes(): Record<Mode, Palette> {
    const css = fs.readFileSync(GLOBALS, 'utf8');
    // Bare `:root {` is the light block; `:root[data-theme='dark'] {` is dark.
    const light = block(css, /:root\s*\{([\s\S]*?)\}/);
    const dark = block(css, /:root\[data-theme='dark'\]\s*\{([\s\S]*?)\}/);
    const pick = (b: string): Palette => ({
        background: token(b, 'background'),
        foreground: token(b, 'foreground'),
    });
    return { light: pick(light), dark: pick(dark) };
}

function hexToRgb(hex: string): [number, number, number] {
    const value = hex.replace('#', '');
    const full =
        value.length === 3
            ? value
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : value;
    return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
    ];
}

// Corner aurora glow, mirroring ProjectCard.module.css: three diffuse radial
// washes anchored top-left, using oklch(0.72 0.16 <hue>) hues, softly present and
// strengthened on hover (ProjectCard reveals its glow on hover). Cool on-theme
// hues (blue / indigo / violet) rather than the site accent alone.
const GLOW_HUES = [210, 250, 290] as const;
const GLOW_STRENGTH: Record<Mode, { base: number; hover: number }> = {
    light: { base: 9, hover: 15 },
    dark: { base: 12, hover: 18 },
};

/** ProjectCard-style top-left aurora: three layered radial washes at `strength`. */
function aurora(strength: number): string {
    const [a, b, c] = GLOW_HUES;
    const wash = (
        size: string,
        at: string,
        hue: number,
        fade: string
    ): string =>
        `radial-gradient(
        ${size} at ${at},
        color-mix(in oklab, oklch(0.72 0.16 ${hue}) ${strength}%, transparent),
        transparent ${fade}
    )`;
    return [
        wash('80% 85%', '0% 0%', a, '78%'),
        wash('70% 75%', '20% 4%', b, '75%'),
        wash('65% 70%', '2% 24%', c, '72%'),
    ].join(',\n    ');
}

// Accent: the muted site indigo, reusing pageGradient.ts's SATURATION 35 /
// LIGHTNESS 52 at hue 234, lifted for contrast on dark. Not palette-derived.
const ACCENT: Record<Mode, { fg: string; emphasis: string; base: string }> = {
    light: { fg: 'hsl(234 42% 46%)', emphasis: 'hsl(234 35% 52%)', base: '234 35% 52%' },
    dark: { fg: 'hsl(234 60% 75%)', emphasis: 'hsl(234 45% 58%)', base: '234 45% 58%' },
};

const STATUS: Record<Mode, { success: string; danger: string; attention: string }> = {
    light: { success: '#1a7f37', danger: '#cf222e', attention: '#9a6700' },
    dark: { success: '#3fb950', danger: '#f85149', attention: '#d29922' },
};

// Static GitHub prettylights syntax palettes (light/dark). Not site-derived.
const SYNTAX: Record<Mode, Record<string, string>> = {
    light: {
        comment: '#6e7781', constant: '#0550ae', entity: '#8250df',
        'storage-modifier-import': '#24292f', 'entity-tag': '#116329',
        keyword: '#cf222e', string: '#0a3069', variable: '#953800',
        'brackethighlighter-unmatched': '#82071e', 'invalid-illegal-text': '#f6f8fa',
        'invalid-illegal-bg': '#82071e', 'carriage-return-text': '#f6f8fa',
        'carriage-return-bg': '#cf222e', 'string-regexp': '#116329',
        'markup-list': '#3b2300', 'markup-heading': '#0550ae',
        'markup-italic': '#24292f', 'markup-bold': '#24292f',
        'markup-deleted-text': '#82071e', 'markup-deleted-bg': '#ffebe9',
        'markup-inserted-text': '#116329', 'markup-inserted-bg': '#dafbe1',
        'markup-changed-text': '#953800', 'markup-changed-bg': '#ffd8b5',
        'markup-ignored-text': '#eaeef2', 'markup-ignored-bg': '#0550ae',
        'meta-diff-range': '#8250df', 'sublimelinter-gutter-mark': '#8c959f',
    },
    dark: {
        comment: '#8b949e', constant: '#79c0ff', entity: '#d2a8ff',
        'storage-modifier-import': '#c9d1d9', 'entity-tag': '#7ee787',
        keyword: '#ff7b72', string: '#a5d6ff', variable: '#ffa657',
        'brackethighlighter-unmatched': '#f85149', 'invalid-illegal-text': '#f0f6fc',
        'invalid-illegal-bg': '#8e1519', 'carriage-return-text': '#f0f6fc',
        'carriage-return-bg': '#b62324', 'string-regexp': '#7ee787',
        'markup-list': '#f2cc60', 'markup-heading': '#1f6feb',
        'markup-italic': '#c9d1d9', 'markup-bold': '#c9d1d9',
        'markup-deleted-text': '#ffdcd7', 'markup-deleted-bg': '#67060c',
        'markup-inserted-text': '#aff5b4', 'markup-inserted-bg': '#033a16',
        'markup-changed-text': '#ffdfb6', 'markup-changed-bg': '#5a1e02',
        'markup-ignored-text': '#c9d1d9', 'markup-ignored-bg': '#1158c7',
        'meta-diff-range': '#d2a8ff', 'sublimelinter-gutter-mark': '#484f58',
    },
};

function buildTheme(mode: Mode, palette: Palette): string {
    const { background, foreground } = palette;
    const [r, g, b] = hexToRgb(foreground);
    const [br, bg, bb] = hexToRgb(background);
    // foreground / background tints
    const fg = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
    const bgc = (a: number) => `rgba(${br}, ${bg}, ${bb}, ${a})`;
    const glow = GLOW_STRENGTH[mode];
    const accent = ACCENT[mode];
    const status = STATUS[mode];
    const syntax = Object.entries(SYNTAX[mode])
        .map(([k, v]) => `    --color-prettylights-syntax-${k}: ${v};`)
        .join('\n');

    return `/* GENERATED by scripts/generate-giscus-themes.ts from src/app/globals.css.
   Do not edit by hand; edit the palette tokens in globals.css or the generator.
   Custom giscus theme (${mode}) matching shibbir.me: a rounded ProjectCard-style
   card with the same corner aurora glow (strengthened on hover), the inverted primary
   button, crimson inline-code chips, and JetBrains Mono for code. giscus loads
   this as a crossorigin stylesheet in its https iframe, so it applies only over
   https (the deployed site), not plain http localhost. */

main {
    /* Inner surfaces transparent so the card gradient shows through; the write box
       and comments get their own inset fills via the tints below. */
    --color-canvas-default: transparent;
    --color-canvas-overlay: ${background};
    --color-canvas-inset: ${fg(0.05)};
    --color-canvas-subtle: ${fg(0.035)};

    /* Text. */
    --color-fg-default: ${foreground};
    --color-fg-muted: ${fg(0.65)};
    --color-fg-subtle: ${fg(0.5)};
    --color-fg-on-emphasis: #ffffff;

    /* Borders: the card's hairline border-foreground/10. */
    --color-border-default: ${fg(0.11)};
    --color-border-muted: ${fg(0.075)};

    /* Neutral fills (hovers, reaction pills, muted backgrounds). */
    --color-neutral-muted: ${fg(0.11)};
    --color-neutral-subtle: ${fg(0.055)};
    --color-neutral-emphasis: ${fg(0.52)};
    --color-neutral-emphasis-plus: ${foreground};

    /* Accent: muted site indigo, from the page-gradient tone. */
    --color-accent-fg: ${accent.fg};
    --color-accent-emphasis: ${accent.emphasis};
    --color-accent-muted: hsl(${accent.base} / 0.4);
    --color-accent-subtle: hsl(${accent.base} / 0.12);

    /* Buttons. */
    --color-btn-text: ${foreground};
    --color-btn-bg: ${fg(0.045)};
    --color-btn-border: ${fg(0.125)};
    --color-btn-shadow: 0 0 transparent;
    --color-btn-inset-shadow: 0 0 transparent;
    --color-btn-hover-bg: ${fg(0.09)};
    --color-btn-hover-border: ${fg(0.21)};
    --color-btn-active-bg: ${fg(0.13)};
    --color-btn-active-border: ${fg(0.25)};
    --color-btn-selected-bg: ${fg(0.09)};
    /* Primary button: the site's inverted button (bg-foreground text-background,
       no border, semibold), matching SaveBar / UpdateToast. */
    --color-btn-primary-text: ${background};
    --color-btn-primary-bg: ${foreground};
    --color-btn-primary-border: transparent;
    --color-btn-primary-hover-bg: ${fg(0.85)};
    --color-btn-primary-hover-border: transparent;
    --color-btn-primary-selected-bg: ${fg(0.9)};
    --color-btn-primary-disabled-text: ${bgc(0.9)};
    --color-btn-primary-disabled-bg: ${fg(0.5)};
    --color-btn-primary-shadow: 0 0 transparent;

    /* Status colors. */
    --color-success-fg: ${status.success};
    --color-danger-fg: ${status.danger};
    --color-attention-fg: ${status.attention};
    --color-done-fg: ${accent.fg};

    /* Inputs. */
    --color-primer-border-active: ${accent.emphasis};
    --color-primer-shadow-focus: 0 0 0 3px hsl(${accent.base} / 0.32);

    /* Reaction buttons. */
    --color-social-reaction-bg-hover: ${fg(0.09)};
    --color-social-reaction-bg-reacted-hover: hsl(${accent.base} / 0.22);

    /* Code syntax highlighting (GitHub ${mode}). */
${syntax}

    color-scheme: ${mode};
    /* One rounded card with the ProjectCard corner aurora glow (soft top-left
       multi-hue washes over the base), strengthened on hover below. */
    background-color: ${background};
    background-image: ${aurora(glow.base)};
    border: 1px solid ${fg(0.1)};
    border-radius: 1rem;
    padding: 1.25rem 1.5rem;
    font-family:
        var(--font-noto-sans, -apple-system), BlinkMacSystemFont, 'Segoe UI',
        Helvetica, Arial, sans-serif;
}

/* Strengthen the corner glow on hover, mirroring ProjectCard's hover reveal. */
main:hover {
    background-image: ${aurora(GLOW_STRENGTH[mode].hover)};
}

/* Write box reads as one rounded card. The write field is two stacked elements,
   the textarea and the markdown-hint bar (.gsc-comment-box-textarea-extras) below
   it, so round the textarea's top corners only and the extras bar's bottom corners
   only, keeping them flush. */
.gsc-comment-box {
    border-radius: 0.75rem;
}
.gsc-comment-box-textarea {
    border-radius: 0.5rem 0.5rem 0 0;
}
.gsc-comment-box-textarea-extras {
    border-radius: 0 0 0.5rem 0.5rem;
}
/* Primary button: match the site's rounded-lg compact button. */
.gsc-comment-box-buttons .btn-primary {
    border-radius: 0.5rem;
    font-weight: 600;
}

/* Inline code: the site's Slack-style crimson chip (ArticleContent.module.css). */
.gsc-comment .markdown code:not(pre code):not(.highlight *) {
    color: #e01e5a;
    background-color: ${fg(0.04)};
    border: 1px solid ${fg(0.13)};
    border-radius: 0.25rem;
    padding: 0.15em 0.35em;
    font-family: var(--font-jetbrains-mono, ui-monospace), SFMono-Regular,
        'SF Mono', Menlo, Consolas, monospace;
}

/* Code block: faint fill, hairline border, rounded, like the article .code-block. */
.gsc-comment .markdown pre {
    background-color: ${fg(0.05)};
    border: 1px solid ${fg(0.12)};
    border-radius: 0.75rem;
    font-family: var(--font-jetbrains-mono, ui-monospace), SFMono-Regular,
        'SF Mono', Menlo, Consolas, monospace;
}
`;
}

function main(): void {
    const palettes = readPalettes();
    (['light', 'dark'] as Mode[]).forEach((mode) => {
        fs.writeFileSync(
            path.join(PUBLIC, `giscus-${mode}.css`),
            buildTheme(mode, palettes[mode])
        );
    });
    console.log('Generated giscus-light.css and giscus-dark.css from globals.css.');
}

main();
