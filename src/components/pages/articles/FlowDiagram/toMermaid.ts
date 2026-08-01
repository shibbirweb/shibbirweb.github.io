import { slugify } from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';
import type {
    FlowDiagramDefinition,
    FlowScenario,
    FlowTone,
} from '@/components/pages/articles/FlowDiagram/types';

// Renders a parsed diagram as mermaid `flowchart` source, so the static view is
// generated from the very same description the interactive one uses. Writing the
// mermaid by hand instead would mean two descriptions per diagram that drift the
// moment one is edited.

/**
 * Tone colours as literals. Mermaid parses `classDef` into inline styles on its
 * own SVG, well outside this component's stylesheet, so it cannot read the CSS
 * custom properties the interactive view uses. Kept in step with the module by
 * hand; they are the same four values the arrowhead markers use.
 */
const TONE_STROKE: Record<FlowTone, string> = {
    neutral: '#64748b',
    secure: '#10b981',
    blocked: '#f43f5e',
    allowed: '#0ea5e9',
};

/** Mermaid node ids may not contain punctuation that would end a statement. */
function mermaidId(id: string): string {
    const safe = slugify(id).replace(/-/g, '_');
    // An id must not start with a digit, which `1.1.1.1` would.
    return /^[0-9]/.test(safe) ? `n_${safe}` : safe;
}

/** Quoted mermaid label text: inner quotes break the parser, so they are swapped. */
function label(text: string): string {
    return text.replace(/"/g, "'");
}

/**
 * Build mermaid source for one scenario. Only that scenario's hops are drawn, so
 * the scenario switch keeps working in the static view exactly as it does in the
 * interactive one, and nodes it does not route are left out entirely rather than
 * dimmed (mermaid has no equivalent of the faded state).
 */
export function toMermaid(
    definition: FlowDiagramDefinition,
    scenario: FlowScenario
): string {
    const routedEdges = definition.edges.filter((edge) =>
        scenario.edgeIds.includes(edge.id)
    );
    const routedNodeIds = new Set(
        routedEdges.flatMap((edge) => [edge.source, edge.target])
    );
    const routedNodes = definition.nodes.filter((node) =>
        routedNodeIds.has(node.id)
    );

    const lines: string[] = ['flowchart LR'];

    for (const node of routedNodes) {
        const text = node.detail
            ? `${label(node.label)}<br/>${label(node.detail)}`
            : label(node.label);
        lines.push(`    ${mermaidId(node.id)}["${text}"]`);
    }

    for (const edge of routedEdges) {
        const arrow = edge.label
            ? `-->|"${label(edge.label)}"|`
            : '-->';
        lines.push(
            `    ${mermaidId(edge.source)} ${arrow} ${mermaidId(edge.target)}`
        );
    }

    // Colour the boxes by tone, matching the interactive view's palette.
    const byTone = new Map<FlowTone, string[]>();
    for (const node of routedNodes) {
        if (!node.tone || node.tone === 'neutral') continue;
        const bucket = byTone.get(node.tone) ?? [];
        bucket.push(mermaidId(node.id));
        byTone.set(node.tone, bucket);
    }
    for (const [tone, ids] of byTone) {
        lines.push(`    classDef ${tone} stroke:${TONE_STROKE[tone]},stroke-width:2px`);
        lines.push(`    class ${ids.join(',')} ${tone}`);
    }

    return lines.join('\n');
}
