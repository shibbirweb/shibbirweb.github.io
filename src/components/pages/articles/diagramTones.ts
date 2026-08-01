import type { FlowTone } from '@/components/pages/articles/FlowDiagram/types';

/**
 * The diagram tone palette as literal hex.
 *
 * The interactive React Flow view reads its tones as CSS custom properties off the
 * frame, which is the right thing wherever a stylesheet can reach. Three renderers
 * cannot reach one: React Flow draws arrowheads into shared `<marker>` defs outside
 * the component's scope, mermaid parses `classDef` into inline styles on its own
 * SVG, and mermaid's `themeVariables` run through colour maths that only accepts
 * real colours. All three need the values spelled out, so they live here once
 * instead of drifting apart in three files.
 *
 * Kept in step by hand with the `--tone-*` declarations in FlowDiagram.module.css.
 */
export const DIAGRAM_TONE_HEX: Record<FlowTone, string> = {
    neutral: '#64748b',
    secure: '#10b981',
    blocked: '#f43f5e',
    allowed: '#0ea5e9',
};

/**
 * Dark-mode palette. Only neutral moves, lifting from slate-500 to slate-400 so a
 * plain box or arrow keeps its contrast against the near-black page, exactly as the
 * module's dark block re-points `--tone-neutral`. The three signal colours already
 * read on both surfaces and stay put.
 */
export const DIAGRAM_TONE_HEX_DARK: Record<FlowTone, string> = {
    ...DIAGRAM_TONE_HEX,
    neutral: '#94a3b8',
};
