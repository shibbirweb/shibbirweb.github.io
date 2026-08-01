import type { MermaidConfig } from 'mermaid';
import {
    DIAGRAM_TONE_HEX,
    DIAGRAM_TONE_HEX_DARK,
} from '@/components/pages/articles/diagramTones';

// Makes mermaid draw in the same design language as the interactive React Flow
// view, so toggling a diagram between the two renderings changes the interaction
// and not the styling. Out of the box mermaid renders square hairline boxes in
// Arial over its own lilac palette, which reads as a foreign widget dropped into
// the article.
//
// `import type` above is load-bearing: it erases at build time, so this module
// stays free of a runtime mermaid import and useMermaidSvg keeps fetching the
// library lazily.

/** Site surface tokens, mirroring the `:root` block in globals.css. */
const SURFACE = {
    light: { background: '#ededed', foreground: '#171717' },
    dark: { background: '#0a0a0a', foreground: '#ededed' },
} as const;

/**
 * Foreground at the opacities the interactive view mixes, as 8-digit hex.
 * `themeVariables` are fed through mermaid's colour maths, which needs real
 * colours, so the `color-mix()` the CSS module uses cannot travel here.
 */
const TEXT_ALPHA = { muted: 'b3', faint: '8c', wash: '0a' } as const;

/** Node and actor borders sit at 45% of their tone, matching `.node` in the module. */
const BORDER_ALPHA = '73';

/**
 * Font stacks. Both tokens are declared outside the SVG and inherit into it, and
 * both carry a fallback because the mono token is scoped to the article body: the
 * full-view modal portals to document.body and never sees it.
 */
const SANS_STACK = 'var(--font-noto-sans, ui-sans-serif), sans-serif';
const MONO_STACK = 'var(--font-jetbrains-mono, ui-monospace), monospace';

/**
 * gitGraph paints branches from `git0`-`git7` rather than from any one variable.
 * The four site tones come first, so a two or three branch history (which is every
 * gitGraph in the articles) is drawn entirely in the palette the rest of the page
 * uses; the lighter repeats only appear once a diagram runs past four branches.
 *
 * `gitBranchLabel<n>` is the text drawn *on* the branch chip, not the chip itself,
 * so it has to contrast with `git<n>` rather than match it. One near-black serves
 * every chip in both themes: the tones are mid-luminance saturated colours that
 * dark text clears comfortably, where white text would fail against sky and
 * emerald. The chips do not change with the theme, so neither does their text.
 */
function gitBranchColors(isDark: boolean): Record<string, string> {
    const tones = isDark ? DIAGRAM_TONE_HEX_DARK : DIAGRAM_TONE_HEX;
    const ramp = [
        tones.neutral,
        tones.allowed,
        tones.secure,
        tones.blocked,
        '#94a3b8',
        '#38bdf8',
        '#34d399',
        '#fb7185',
    ];

    return Object.fromEntries(
        ramp.flatMap((color, index) => [
            [`git${index}`, color],
            [`gitBranchLabel${index}`, SURFACE.light.foreground],
        ])
    );
}

/**
 * The palette. Every value has to be a literal colour: mermaid runs these through
 * khroma (darken / lighten / invert / adjust) to derive the variables we do not
 * set, and a `var(--token)` string would poison that maths. Live tokens are used
 * in `themeCSS` below instead, which is plain CSS and never touched by khroma.
 */
function themeVariables(isDark: boolean): Record<string, string> {
    const { background, foreground } = isDark ? SURFACE.dark : SURFACE.light;
    const tones = isDark ? DIAGRAM_TONE_HEX_DARK : DIAGRAM_TONE_HEX;
    const border = `${tones.neutral}${BORDER_ALPHA}`;

    return {
        ...gitBranchColors(isDark),

        fontFamily: SANS_STACK,
        fontSize: '14px',

        background,
        primaryColor: background,
        mainBkg: background,
        secondaryColor: background,
        tertiaryColor: background,
        primaryBorderColor: border,
        nodeBorder: border,
        strokeWidth: '2',

        primaryTextColor: foreground,
        textColor: foreground,
        nodeTextColor: foreground,
        titleColor: foreground,

        lineColor: tones.neutral,
        arrowheadColor: tones.neutral,
        edgeLabelBackground: background,

        // Sequence diagrams. The actor box is the same tile as a flowchart node;
        // a note is the quieter aside it is in prose, so it sits on a faint wash
        // of the foreground rather than mermaid's postage-yellow.
        actorBkg: background,
        actorBorder: border,
        actorTextColor: foreground,
        actorLineColor: `${tones.neutral}${BORDER_ALPHA}`,
        signalColor: tones.neutral,
        signalTextColor: `${foreground}${TEXT_ALPHA.muted}`,
        labelBoxBkgColor: background,
        labelBoxBorderColor: border,
        labelTextColor: foreground,
        loopTextColor: `${foreground}${TEXT_ALPHA.muted}`,
        noteBkgColor: `${foreground}${TEXT_ALPHA.wash}`,
        noteBorderColor: border,
        noteTextColor: foreground,
        activationBkgColor: background,
        activationBorderColor: border,
        sequenceNumberColor: background,

        // gitGraph chrome that sits outside the branch ramp.
        commitLabelColor: `${foreground}${TEXT_ALPHA.muted}`,
        commitLabelBackground: background,
        tagLabelColor: foreground,
        tagLabelBackground: background,
        tagLabelBorder: border,
    };
}

/**
 * The geometry and typography no theme variable can express.
 *
 * This is a CSS string rather than the co-located CSS Module the project's styling
 * rule asks for, because an external stylesheet cannot reach it. Mermaid compiles
 * its own sheet through `compileCSS(svgId, ...)`, which prefixes every rule with
 * `#<svgId>`, so its defaults land at id specificity and a module class on an
 * ancestor would always lose. `themeCSS` is spliced into that same sheet, gets the
 * same prefix, and is emitted last, so it wins ties by source order. It still
 * loses to `classDef`, which mermaid marks `!important`, which is exactly right:
 * the per-tone strokes toMermaid.ts generates stay in charge of their own nodes.
 *
 * Unlike the variables above, this is ordinary CSS living inside the document, so
 * `var()` and `color-mix()` work and the surface follows the theme on its own.
 */
function themeCss(isDark: boolean): string {
    const tones = isDark ? DIAGRAM_TONE_HEX_DARK : DIAGRAM_TONE_HEX;
    const nodeBorder = `color-mix(in oklab, ${tones.neutral} 45%, transparent)`;
    const mutedText = 'color-mix(in oklab, var(--foreground) 70%, transparent)';

    return `
    /* The interactive view's 12px tile radius. rx/ry are the only way to round a
       rect from CSS, and they are kept off the other shapes because rx means the
       radius itself on an ellipse. They beat the rx presentation attribute the
       sequence renderer writes, since any CSS rule outranks one. Engines without
       the geometry properties draw square corners rather than nothing. */
    .node rect,
    .cluster rect,
    rect.actor,
    .activation0,
    .activation1,
    .activation2 {
        rx: 12px;
        ry: 12px;
    }

    /* Notes and label boxes are smaller and sit inside the diagram, so they take
       the tighter radius, the way a callout chip does in the article body. */
    .note,
    .labelBox {
        rx: 8px;
        ry: 8px;
    }

    .node rect,
    .node circle,
    .node ellipse,
    .node polygon,
    .node path {
        fill: var(--background);
        stroke: ${nodeBorder};
        stroke-width: 2px;
    }

    .cluster rect {
        fill: color-mix(in oklab, var(--foreground) 4%, transparent);
        stroke: ${nodeBorder};
        stroke-width: 1px;
    }

    .nodeLabel,
    .nodeLabel p,
    .label,
    .cluster-label,
    .cluster-label p {
        font-family: ${SANS_STACK};
        font-size: 0.8rem;
        font-weight: 600;
        line-height: 1.25;
        color: var(--foreground);
    }

    /* Edges: 1.75px, thinner than the 2px node border so an arrow reads as a
       connection rather than another edge of the box. */
    .edgePath .path,
    .flowchart-link,
    .edge-thickness-normal {
        stroke: ${tones.neutral};
        stroke-width: 1.75px;
    }

    /* Edge labels: the small mono chip the interactive view floats on the arrow. */
    .edgeLabel,
    .edgeLabel p,
    .edgeLabel span {
        font-family: ${MONO_STACK};
        font-size: 0.6rem;
        font-weight: 400;
        line-height: 1.25;
        color: ${mutedText};
        background-color: transparent;
    }

    .edgeLabel p {
        border-radius: 0.25rem;
        padding: 0.125rem 0.375rem;
        background-color: var(--background);
    }

    .edgeLabel rect,
    .labelBkg {
        fill: var(--background);
        background-color: var(--background);
        opacity: 1;
    }

    /* Sequence diagrams. The renderer writes its font sizes inline, which no rule
       here can outrank, so those are set through the sequence config block
       instead; this is only what the inline styles leave alone. */
    .messageLine0,
    .messageLine1 {
        stroke-width: 1.75;
    }

    .actor-line {
        stroke-dasharray: 4 4;
    }

    /* gitGraph. The arrow defaults to a heavy 8px, which swamps the commits at
       this scale; 3px keeps the branch readable without shouting. */
    .arrow {
        stroke-width: 3;
    }

    /* Commit ids are literal git subjects, so they read as code. Safe to restyle
       only because the chip behind them is hidden just below: mermaid sizes every
       other gitGraph chip by measuring its text in the theme font, so overriding
       the font on a label that keeps its background (a branch or tag chip) would
       leave the text and the box it sits in disagreeing about how wide it is. */
    .commit-label {
        font-family: ${MONO_STACK};
        font-size: 0.65rem;
    }

    .commit-label-bkg {
        opacity: 0;
    }
    `;
}

/**
 * The full mermaid configuration for a resolved theme. Rebuilt per render because
 * the palette is theme-keyed, which is what makes an OS scheme flip or a manual
 * switch redraw in the right colours.
 */
export function mermaidConfig(isDark: boolean): MermaidConfig {
    return {
        startOnLoad: false,
        theme: 'base',
        themeVariables: themeVariables(isDark),
        themeCSS: themeCss(isDark),
        flowchart: {
            // Orthogonal segments with rounded corners, the same path shape
            // React Flow's getSmoothStepPath draws in the interactive view.
            curve: 'rounded',
            padding: 14,
            nodeSpacing: 56,
            rankSpacing: 64,
            useMaxWidth: true,
        },
        // The sequence renderer measures its text and then writes font-size and
        // font-family inline on each element, so these cannot come from themeCSS
        // the way the flowchart's can: an inline style outranks any rule. Sized to
        // land in the same scale as a flowchart node label rather than mermaid's
        // 16px default, which dwarfs everything around it.
        sequence: {
            actorFontFamily: SANS_STACK,
            actorFontSize: 13,
            actorFontWeight: 600,
            messageFontFamily: SANS_STACK,
            messageFontSize: 12,
            messageFontWeight: 400,
            noteFontFamily: SANS_STACK,
            noteFontSize: 12,
            noteFontWeight: 400,
            useMaxWidth: true,
        },
    };
}
