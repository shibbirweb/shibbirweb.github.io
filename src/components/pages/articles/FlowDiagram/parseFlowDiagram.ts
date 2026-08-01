import {
    FLOW_TONES,
    type FlowDiagramDefinition,
    type FlowEdgeSpec,
    type FlowNodeSpec,
    type FlowScenario,
    type FlowTone,
    type FlowView,
} from '@/components/pages/articles/FlowDiagram/types';

// Parser for the `reactflow` fence: a deliberately small, mermaid-like line
// format. Pure and dependency-free, so it can be unit tested without a DOM.
//
// The grammar, in full:
//
//   title: Accessible name for the whole diagram
//   # a comment
//   scenario "VPN on"            opens a scenario; hops below belong to it
//   Desktop [tunnel is up] {secure}          declares a node
//   Desktop --> wg-easy (encrypted) {secure} declares a hop
//   > prose                      attaches to whatever was declared above
//
// Nodes are shared across every scenario of a diagram (a node mentioned anywhere
// is drawn everywhere), which is what keeps the picture from rearranging when the
// reader toggles. Scenarios differ only in which hops they route through.

/** Everything the parser rejects carries the offending line, so failures are loud. */
export class FlowDiagramParseError extends Error {
    constructor(message: string, lineNumber: number, line: string) {
        super(`line ${lineNumber}: ${message}\n  ${line.trim()}`);
        this.name = 'FlowDiagramParseError';
    }
}

/** A stable id for a declared name: `ISP DNS` becomes `isp-dns`. */
export function slugify(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function readTone(
    raw: string | undefined,
    lineNumber: number,
    line: string
): FlowTone | undefined {
    if (!raw) return undefined;
    const tone = raw.trim();
    if (!FLOW_TONES.includes(tone as FlowTone)) {
        throw new FlowDiagramParseError(
            `unknown tone "${tone}", expected one of ${FLOW_TONES.join(', ')}`,
            lineNumber,
            line
        );
    }
    return tone as FlowTone;
}

/** `Name [detail] {tone}`, both bracketed parts optional. */
const NODE_PATTERN = /^(.*?)\s*(?:\[([^\]]*)\])?\s*(?:\{([^}]*)\})?\s*$/;
/** The right side of an arrow: `Target (label) {tone}`. */
const TARGET_PATTERN = /^(.*?)\s*(?:\(([^)]*)\))?\s*(?:\{([^}]*)\})?\s*$/;
const SCENARIO_PATTERN = /^scenario\s+"([^"]+)"\s*$/i;

/** Where a following `>` prose line should be attached. */
type ProseTarget =
    | { kind: 'scenario'; id: string }
    | { kind: 'node'; id: string }
    | { kind: 'edge'; id: string }
    | null;

/**
 * Parse `reactflow` fence source into a diagram definition. Throws a
 * `FlowDiagramParseError` naming the line for anything malformed, so a typo fails
 * the build rather than silently rendering a diagram with a missing arrow.
 */
export function parseFlowDiagram(source: string): FlowDiagramDefinition {
    const nodes = new Map<string, FlowNodeSpec>();
    const edges = new Map<string, FlowEdgeSpec>();
    const scenarios: FlowScenario[] = [];
    let title: string | undefined;
    let defaultView: FlowView | undefined;
    let diagramMermaid: string | undefined;
    let showPackets: boolean | undefined;
    let currentScenario: FlowScenario | null = null;
    let proseTarget: ProseTarget = null;

    /** Registers a node on first mention; later mentions only fill in blanks. */
    const upsertNode = (spec: FlowNodeSpec): FlowNodeSpec => {
        const existing = nodes.get(spec.id);
        if (!existing) {
            nodes.set(spec.id, spec);
            return spec;
        }
        existing.detail ??= spec.detail;
        existing.tone ??= spec.tone;
        return existing;
    };

    const lines = source.split('\n');

    // A `mermaid:` block is captured verbatim, because mermaid source is full of
    // `-->`, `[`, `{` and `>` which this grammar would otherwise interpret. The
    // block runs from the `mermaid:` line to the next line indented no further
    // than it, and is dedented as a whole.
    let capture: {
        baseIndent: number;
        lines: string[];
        scenario: FlowScenario | null;
    } | null = null;

    const indentOf = (text: string) => text.length - text.trimStart().length;

    const finishCapture = () => {
        if (!capture) return;
        const body = [...capture.lines];
        while (body.length && !body[body.length - 1].trim()) body.pop();
        const indents = body
            .filter((entry) => entry.trim())
            .map((entry) => indentOf(entry));
        const dedent = indents.length ? Math.min(...indents) : 0;
        const source = body.map((entry) => entry.slice(dedent)).join('\n');
        if (source.trim()) {
            if (capture.scenario) {
                capture.scenario.mermaid = source;
            } else {
                diagramMermaid = source;
            }
        }
        capture = null;
    };

    lines.forEach((rawLine, index) => {
        const lineNumber = index + 1;
        const line = rawLine.trim();

        if (capture) {
            if (!line || indentOf(rawLine) > capture.baseIndent) {
                capture.lines.push(rawLine);
                return;
            }
            finishCapture();
        }

        if (/^mermaid\s*:\s*$/i.test(line)) {
            capture = {
                baseIndent: indentOf(rawLine),
                lines: [],
                scenario: currentScenario,
            };
            proseTarget = null;
            return;
        }

        if (!line || line.startsWith('#')) return;

        // Prose attaches to the most recent declaration; repeated lines join up.
        if (line.startsWith('>')) {
            const text = line.slice(1).trim();
            // Copied to a const so it stays narrowed inside the find() closure.
            const target = proseTarget;
            if (!target) {
                throw new FlowDiagramParseError(
                    'prose line has nothing above it to describe',
                    lineNumber,
                    rawLine
                );
            }
            const append = (existing: string | undefined) =>
                existing ? `${existing} ${text}` : text;
            if (target.kind === 'scenario') {
                const scenario = scenarios.find((s) => s.id === target.id);
                if (scenario) scenario.summary = append(scenario.summary);
            } else if (target.kind === 'node') {
                const node = nodes.get(target.id);
                if (node) node.description = append(node.description);
            } else {
                const edge = edges.get(target.id);
                if (edge) edge.caption = append(edge.caption);
            }
            return;
        }

        if (/^title\s*:/i.test(line)) {
            title = line.replace(/^title\s*:/i, '').trim();
            proseTarget = null;
            return;
        }

        if (/^default\s*:/i.test(line)) {
            const value = line.replace(/^default\s*:/i, '').trim().toLowerCase();
            if (value !== 'static' && value !== 'interactive') {
                throw new FlowDiagramParseError(
                    `default must be "static" or "interactive", got "${value}"`,
                    lineNumber,
                    rawLine
                );
            }
            defaultView = value;
            proseTarget = null;
            return;
        }

        if (/^packets\s*:/i.test(line)) {
            const value = line.replace(/^packets\s*:/i, '').trim().toLowerCase();
            if (value !== 'on' && value !== 'off') {
                throw new FlowDiagramParseError(
                    `packets must be "on" or "off", got "${value}"`,
                    lineNumber,
                    rawLine
                );
            }
            showPackets = value === 'on';
            proseTarget = null;
            return;
        }

        const scenarioMatch = line.match(SCENARIO_PATTERN);
        if (scenarioMatch) {
            const label = scenarioMatch[1].trim();
            const id = slugify(label);
            if (scenarios.some((s) => s.id === id)) {
                throw new FlowDiagramParseError(
                    `duplicate scenario "${label}"`,
                    lineNumber,
                    rawLine
                );
            }
            currentScenario = { id, label, edgeIds: [] };
            scenarios.push(currentScenario);
            proseTarget = { kind: 'scenario', id };
            return;
        }

        if (line.includes('-->')) {
            const [rawSource, ...rest] = line.split('-->');
            if (rest.length !== 1) {
                throw new FlowDiagramParseError(
                    'a hop must have exactly one "-->"',
                    lineNumber,
                    rawLine
                );
            }
            const sourceName = rawSource.trim();
            if (!sourceName) {
                throw new FlowDiagramParseError(
                    'hop is missing a source',
                    lineNumber,
                    rawLine
                );
            }
            const targetMatch = rest[0].trim().match(TARGET_PATTERN);
            const targetName = targetMatch?.[1]?.trim() ?? '';
            if (!targetName) {
                throw new FlowDiagramParseError(
                    'hop is missing a target',
                    lineNumber,
                    rawLine
                );
            }

            const sourceId = slugify(sourceName);
            const targetId = slugify(targetName);
            // A hop may name nodes that were never declared on their own line;
            // those get a plain box labelled with the name they were given.
            upsertNode({ id: sourceId, label: sourceName });
            upsertNode({ id: targetId, label: targetName });

            const edgeId = `${sourceId}--${targetId}`;
            const existing = edges.get(edgeId);
            const spec: FlowEdgeSpec = existing ?? {
                id: edgeId,
                source: sourceId,
                target: targetId,
            };
            spec.label ??= targetMatch?.[2]?.trim() || undefined;
            spec.tone ??= readTone(targetMatch?.[3], lineNumber, rawLine);
            edges.set(edgeId, spec);

            if (!currentScenario) {
                throw new FlowDiagramParseError(
                    'hop declared before any `scenario "..."` line',
                    lineNumber,
                    rawLine
                );
            }
            if (!currentScenario.edgeIds.includes(edgeId)) {
                currentScenario.edgeIds.push(edgeId);
            }
            proseTarget = { kind: 'edge', id: edgeId };
            return;
        }

        // Anything else is a node declaration.
        const nodeMatch = line.match(NODE_PATTERN);
        const name = nodeMatch?.[1]?.trim() ?? '';
        if (!name) {
            throw new FlowDiagramParseError(
                'could not read a node name',
                lineNumber,
                rawLine
            );
        }
        const node = upsertNode({
            id: slugify(name),
            label: name,
            detail: nodeMatch?.[2]?.trim() || undefined,
            tone: readTone(nodeMatch?.[3], lineNumber, rawLine),
        });
        proseTarget = { kind: 'node', id: node.id };
    });

    // A block that ran to the end of the fence still has to be committed.
    finishCapture();

    if (scenarios.length === 0) {
        throw new FlowDiagramParseError(
            'diagram has no `scenario "..."` block',
            lines.length,
            ''
        );
    }

    return {
        title,
        defaultView,
        mermaid: diagramMermaid,
        showPackets,
        nodes: [...nodes.values()],
        edges: [...edges.values()],
        scenarios,
    };
}
