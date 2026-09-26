import { describe, expect, it } from 'vitest';
import { DIAGRAM_TONE_HEX } from '@/components/pages/articles/diagramTones';
import { parseFlowDiagram } from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';
import {
    flowMermaidSource,
    toMermaid,
} from '@/components/pages/articles/FlowDiagram/toMermaid';
import type { FlowDiagramDefinition } from '@/components/pages/articles/FlowDiagram/types';

function parse(...lines: string[]): FlowDiagramDefinition {
    return parseFlowDiagram(lines.join('\n'));
}

/** The mermaid for a one-scenario diagram, split into lines. */
function mermaidLines(...lines: string[]): string[] {
    const definition = parse('scenario "Only"', ...lines);
    return toMermaid(definition, definition.scenarios[0]).split('\n');
}

describe('toMermaid', () => {
    it('opens with a left-to-right flowchart header', () => {
        expect(mermaidLines('Phone --> Router')[0]).toBe('flowchart LR');
    });

    it('declares every routed node as a quoted box, then every hop', () => {
        expect(mermaidLines('Phone --> Router')).toEqual([
            'flowchart LR',
            '    phone["Phone"]',
            '    router["Router"]',
            '    phone --> router',
        ]);
    });

    it('turns hyphens in ids into underscores', () => {
        const lines = mermaidLines('Pi-hole --> Ad blocked');

        expect(lines).toContain('    pi_hole["Pi-hole"]');
        expect(lines).toContain('    ad_blocked["Ad blocked"]');
        expect(lines).toContain('    pi_hole --> ad_blocked');
    });

    it('prefixes an id that would start with a digit', () => {
        const lines = mermaidLines('Router --> 1.1.1.1');

        expect(lines).toContain('    n_1_1_1_1["1.1.1.1"]');
        expect(lines).toContain('    router --> n_1_1_1_1');
    });

    it('draws a node detail as a second line', () => {
        const lines = mermaidLines('Router [192.168.0.1]', 'Phone --> Router');

        expect(lines).toContain('    router["Router<br/>192.168.0.1"]');
    });

    it('swaps double quotes in labels for single quotes', () => {
        const lines = mermaidLines(
            'Say "hi" [the "detail"]',
            'Say "hi" --> Reply (a "quoted" label)'
        );

        expect(lines).toContain(`    say_hi["Say 'hi'<br/>the 'detail'"]`);
        expect(lines).toContain(`    say_hi -->|"a 'quoted' label"| reply`);
    });

    it('writes a hop label as a quoted edge label', () => {
        const lines = mermaidLines('Router --> Pi-hole (all DNS)');

        expect(lines).toContain('    router -->|"all DNS"| pi_hole');
    });

    it('adds one classDef and class line per non-neutral node tone', () => {
        const lines = mermaidLines(
            'Desktop {secure}',
            'Tunnel {secure}',
            'Ad {blocked}',
            'Plain {neutral}',
            'Desktop --> Tunnel',
            'Tunnel --> Ad',
            'Tunnel --> Plain'
        );

        expect(lines).toContain(
            `    classDef secure stroke:${DIAGRAM_TONE_HEX.secure},stroke-width:2px`
        );
        expect(lines).toContain('    class desktop,tunnel secure');
        expect(lines).toContain(
            `    classDef blocked stroke:${DIAGRAM_TONE_HEX.blocked},stroke-width:2px`
        );
        expect(lines).toContain('    class ad blocked');
        expect(lines.some((line) => line.includes('neutral'))).toBe(false);
    });

    it('adds no class lines when no node carries a tone', () => {
        const lines = mermaidLines('A --> B {secure}');

        expect(lines.some((line) => line.includes('classDef'))).toBe(false);
    });

    it('draws only the nodes and hops the given scenario routes', () => {
        const definition = parse(
            'Unused box',
            'scenario "Left"',
            'Start --> Left',
            'scenario "Right"',
            'Start --> Right'
        );
        const [left, right] = definition.scenarios;

        const leftSource = toMermaid(definition, left);
        const rightSource = toMermaid(definition, right);

        expect(leftSource).toContain('start --> left');
        expect(leftSource).not.toContain('right');
        expect(rightSource).toContain('start --> right');
        expect(rightSource).not.toMatch(/\bleft\b/);
        expect(leftSource).not.toContain('unused');
        expect(rightSource).not.toContain('unused');
    });

    it('renders just the header for a scenario with no hops', () => {
        const definition: FlowDiagramDefinition = {
            nodes: [{ id: 'a', label: 'A' }],
            edges: [],
            scenarios: [{ id: 'empty', label: 'Empty', edgeIds: [] }],
        };

        expect(toMermaid(definition, definition.scenarios[0])).toBe(
            'flowchart LR'
        );
    });
});

describe('flowMermaidSource', () => {
    const generatedSource = 'flowchart LR\n    a["A"]\n    b["B"]\n    a --> b';

    it('prefers the scenario block over the diagram block', () => {
        const definition = parse(
            'mermaid:',
            '    graph TD',
            'scenario "Own"',
            'A --> B',
            'mermaid:',
            '    sequenceDiagram'
        );

        expect(flowMermaidSource(definition, definition.scenarios[0])).toBe(
            'sequenceDiagram'
        );
    });

    it('falls back to the diagram block when the scenario has none', () => {
        const definition = parse(
            'mermaid:',
            '    graph TD',
            'scenario "Shared"',
            'A --> B'
        );

        expect(flowMermaidSource(definition, definition.scenarios[0])).toBe(
            'graph TD'
        );
    });

    it('generates mermaid when no block is declared', () => {
        const definition = parse('scenario "Generated"', 'A --> B');

        expect(flowMermaidSource(definition, definition.scenarios[0])).toBe(
            generatedSource
        );
    });
});
