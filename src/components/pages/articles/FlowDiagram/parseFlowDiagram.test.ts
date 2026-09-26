import { describe, expect, it } from 'vitest';
import {
    FlowDiagramParseError,
    parseFlowDiagram,
    slugify,
} from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';

/** Joins fence lines so each test reads like the block an author would write. */
function source(...lines: string[]): string {
    return lines.join('\n');
}

/** Runs the parser and returns the thrown parse error, failing if none is thrown. */
function parseError(text: string): FlowDiagramParseError {
    try {
        parseFlowDiagram(text);
    } catch (error) {
        if (error instanceof FlowDiagramParseError) {
            return error;
        }
        throw error;
    }
    throw new Error('expected parseFlowDiagram to throw');
}

describe('slugify', () => {
    it('lowercases a name and joins its words with hyphens', () => {
        expect(slugify('ISP DNS')).toBe('isp-dns');
    });

    it('collapses runs of punctuation and trims them from both ends', () => {
        expect(slugify('  Hello, World!  ')).toBe('hello-world');
        expect(slugify('fix: guard')).toBe('fix-guard');
        expect(slugify('1.1.1.1')).toBe('1-1-1-1');
    });

    it('returns an empty string for a name with no letters or digits', () => {
        expect(slugify('---')).toBe('');
    });
});

describe('parseFlowDiagram settings', () => {
    it('reads the title, default view and packets setting', () => {
        const definition = parseFlowDiagram(
            source(
                'title: How a phone reaches Pi-hole',
                'default: Interactive',
                'packets: off',
                'scenario "Only"',
                'Phone --> Router'
            )
        );

        expect(definition.title).toBe('How a phone reaches Pi-hole');
        expect(definition.defaultView).toBe('interactive');
        expect(definition.showPackets).toBe(false);
    });

    it('turns packets on with "on"', () => {
        const definition = parseFlowDiagram(
            source('packets: on', 'scenario "Only"', 'A --> B')
        );

        expect(definition.showPackets).toBe(true);
    });

    it('leaves unset settings undefined', () => {
        const definition = parseFlowDiagram(
            source('scenario "Only"', 'A --> B')
        );

        expect(definition.title).toBeUndefined();
        expect(definition.defaultView).toBeUndefined();
        expect(definition.showPackets).toBeUndefined();
        expect(definition.mermaid).toBeUndefined();
    });

    it('rejects a default view other than static or interactive', () => {
        const error = parseError(
            source('default: fancy', 'scenario "Only"', 'A --> B')
        );

        expect(error.message).toContain(
            'default must be "static" or "interactive", got "fancy"'
        );
    });

    it('rejects a packets value other than on or off', () => {
        const error = parseError(
            source('packets: yes', 'scenario "Only"', 'A --> B')
        );

        expect(error.message).toContain('packets must be "on" or "off"');
    });

    it('ignores comment lines and blank lines', () => {
        const definition = parseFlowDiagram(
            source(
                '# a comment about the diagram',
                '',
                'scenario "Only"',
                '   # an indented comment',
                'A --> B'
            )
        );

        expect(definition.nodes.map((node) => node.id)).toEqual(['a', 'b']);
    });
});

describe('parseFlowDiagram scenarios', () => {
    it('gives each scenario a slug id and keeps its label', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "VPN on"',
                'A --> B',
                'SCENARIO "VPN off"',
                'A --> C'
            )
        );

        expect(
            definition.scenarios.map(({ id, label }) => ({ id, label }))
        ).toEqual([
            { id: 'vpn-on', label: 'VPN on' },
            { id: 'vpn-off', label: 'VPN off' },
        ]);
    });

    it('assigns each hop to the scenario above it', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "First"',
                'A --> B',
                'B --> C',
                'scenario "Second"',
                'A --> C'
            )
        );

        expect(definition.scenarios[0].edgeIds).toEqual(['a--b', 'b--c']);
        expect(definition.scenarios[1].edgeIds).toEqual(['a--c']);
    });

    it('shares one edge between scenarios that route the same hop', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "First"',
                'A --> B',
                'scenario "Second"',
                'A --> B'
            )
        );

        expect(definition.edges).toHaveLength(1);
        expect(definition.scenarios[0].edgeIds).toEqual(['a--b']);
        expect(definition.scenarios[1].edgeIds).toEqual(['a--b']);
    });

    it('lists a hop repeated within one scenario only once', () => {
        const definition = parseFlowDiagram(
            source('scenario "Only"', 'A --> B', 'A --> B')
        );

        expect(definition.scenarios[0].edgeIds).toEqual(['a--b']);
    });

    it('rejects two scenarios whose labels slugify to the same id', () => {
        const error = parseError(
            source(
                'scenario "VPN on"',
                'A --> B',
                'scenario "VPN On"',
                'A --> C'
            )
        );

        expect(error.message).toContain('duplicate scenario "VPN On"');
        expect(error.message).toMatch(/^line 3:/);
    });

    it('rejects a hop declared before any scenario', () => {
        const error = parseError(source('A --> B', 'scenario "Only"'));

        expect(error.message).toContain(
            'hop declared before any `scenario "..."` line'
        );
        expect(error.message).toMatch(/^line 1:/);
    });

    it('requires at least one scenario', () => {
        const error = parseError(source('title: Nothing here', 'Router'));

        expect(error.message).toContain(
            'diagram has no `scenario "..."` block'
        );
    });

    it('treats an empty source as having no scenario', () => {
        expect(() => parseFlowDiagram('')).toThrow(FlowDiagramParseError);
    });
});

describe('parseFlowDiagram nodes', () => {
    it('reads a node name, detail and tone', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "Only"',
                'Router [192.168.0.1] {secure}',
                'Router --> Pi-hole'
            )
        );

        expect(definition.nodes[0]).toEqual({
            id: 'router',
            label: 'Router',
            detail: '192.168.0.1',
            tone: 'secure',
        });
    });

    it('accepts a node with only a tone and no detail', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "Only"',
                'Ad blocked {blocked}',
                'A --> Ad blocked'
            )
        );

        const blocked = definition.nodes.find(
            (node) => node.id === 'ad-blocked'
        );
        expect(blocked).toEqual({
            id: 'ad-blocked',
            label: 'Ad blocked',
            detail: undefined,
            tone: 'blocked',
        });
    });

    it('keeps a node declared on its own line even when no hop uses it', () => {
        const definition = parseFlowDiagram(
            source('scenario "Only"', 'Lonely box', 'A --> B')
        );

        expect(definition.nodes.map((node) => node.id)).toContain('lonely-box');
    });

    it('lets a later mention fill in blanks but never overwrite them', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "Only"',
                'ISP DNS --> Router',
                'isp dns [1.1.1.1] {secure}',
                'ISP dns [8.8.8.8] {blocked}'
            )
        );

        const ispDns = definition.nodes.find((node) => node.id === 'isp-dns');
        expect(ispDns).toEqual({
            id: 'isp-dns',
            label: 'ISP DNS',
            detail: '1.1.1.1',
            tone: 'secure',
        });
        expect(
            definition.nodes.filter((node) => node.id === 'isp-dns')
        ).toHaveLength(1);
    });

    it('rejects a line that has no node name', () => {
        const error = parseError(
            source('scenario "Only"', 'A --> B', '[just a detail]')
        );

        expect(error.message).toContain('could not read a node name');
        expect(error.message).toMatch(/^line 3:/);
    });
});

describe('parseFlowDiagram hops', () => {
    it('reads the label and tone of a hop', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "Only"',
                'Pi-hole --> Ad blocked (ad domain) {blocked}'
            )
        );

        expect(definition.edges).toEqual([
            {
                id: 'pi-hole--ad-blocked',
                source: 'pi-hole',
                target: 'ad-blocked',
                label: 'ad domain',
                tone: 'blocked',
            },
        ]);
    });

    it('leaves the label and tone undefined on a bare hop', () => {
        const definition = parseFlowDiagram(
            source('scenario "Only"', 'Phone --> Router')
        );

        expect(definition.edges[0].label).toBeUndefined();
        expect(definition.edges[0].tone).toBeUndefined();
    });

    it('creates plain nodes for names first mentioned in a hop', () => {
        const definition = parseFlowDiagram(
            source('scenario "Only"', 'Phone --> Home Router')
        );

        expect(definition.nodes).toEqual([
            { id: 'phone', label: 'Phone' },
            { id: 'home-router', label: 'Home Router' },
        ]);
    });

    it('rejects a hop with more than one arrow', () => {
        const error = parseError(source('scenario "Only"', 'A --> B --> C'));

        expect(error.message).toContain('a hop must have exactly one "-->"');
    });

    it('rejects a hop with no source', () => {
        const error = parseError(source('scenario "Only"', '--> B'));

        expect(error.message).toContain('hop is missing a source');
    });

    it('rejects a hop with no target', () => {
        const missingTarget = parseError(source('scenario "Only"', 'A -->'));
        const labelOnly = parseError(
            source('scenario "Only"', 'A --> (label only)')
        );

        expect(missingTarget.message).toContain('hop is missing a target');
        expect(labelOnly.message).toContain('hop is missing a target');
    });
});

describe('parseFlowDiagram tones', () => {
    it('rejects an unknown tone on a node and lists the valid ones', () => {
        const error = parseError(
            source('scenario "Only"', 'Router {purple}', 'A --> B')
        );

        expect(error.message).toContain(
            'unknown tone "purple", expected one of neutral, secure, blocked, allowed'
        );
        expect(error.message).toMatch(/^line 2:/);
    });

    it('rejects an unknown tone on a hop', () => {
        const error = parseError(source('scenario "Only"', 'A --> B {loud}'));

        expect(error.message).toContain('unknown tone "loud"');
    });
});

describe('parseFlowDiagram prose', () => {
    it('attaches prose to the scenario, node or hop declared above it', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "Only"',
                '> The scenario summary.',
                'Router',
                '> What the router does.',
                'Phone --> Router',
                '> What this hop carries.'
            )
        );

        expect(definition.scenarios[0].summary).toBe('The scenario summary.');
        expect(
            definition.nodes.find((node) => node.id === 'router')?.description
        ).toBe('What the router does.');
        expect(definition.edges[0].caption).toBe('What this hop carries.');
    });

    it('joins consecutive prose lines with a space', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "Only"',
                '> First half,',
                '>   second half.',
                'A --> B'
            )
        );

        expect(definition.scenarios[0].summary).toBe(
            'First half, second half.'
        );
    });

    it('still attaches prose separated from its declaration by a blank line', () => {
        const definition = parseFlowDiagram(
            source('scenario "Only"', 'Router', '', '> Described.', 'A --> B')
        );

        expect(
            definition.nodes.find((node) => node.id === 'router')?.description
        ).toBe('Described.');
    });

    it('rejects prose with nothing above it to describe', () => {
        const error = parseError(source('> Orphan prose', 'scenario "Only"'));

        expect(error.message).toContain(
            'prose line has nothing above it to describe'
        );
        expect(error.message).toMatch(/^line 1:/);
    });

    it('rejects prose that follows a setting line', () => {
        const error = parseError(
            source('title: A title', '> Not a description', 'scenario "Only"')
        );

        expect(error.message).toContain('prose line has nothing above it');
    });
});

describe('parseFlowDiagram mermaid blocks', () => {
    it('captures a diagram-level block, dedented, before any scenario', () => {
        const definition = parseFlowDiagram(
            source(
                'mermaid:',
                '    flowchart LR',
                '        A --> B',
                'scenario "Only"',
                'A --> B'
            )
        );

        expect(definition.mermaid).toBe('flowchart LR\n    A --> B');
        expect(definition.scenarios[0].mermaid).toBeUndefined();
    });

    it('captures a block inside a scenario as that scenario only', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "First"',
                'A --> B',
                'mermaid:',
                '    sequenceDiagram',
                '        A->>B: hello',
                'scenario "Second"',
                'A --> C'
            )
        );

        expect(definition.scenarios[0].mermaid).toBe(
            'sequenceDiagram\n    A->>B: hello'
        );
        expect(definition.scenarios[1].mermaid).toBeUndefined();
        expect(definition.mermaid).toBeUndefined();
    });

    it('does not read arrows or brackets inside the block as the grammar', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "Only"',
                'A --> B',
                'mermaid:',
                '    flowchart LR',
                '        X[box] --> Y{decision}',
                '        > not prose'
            )
        );

        expect(definition.edges.map((edge) => edge.id)).toEqual(['a--b']);
        expect(definition.nodes.map((node) => node.id)).toEqual(['a', 'b']);
    });

    it('keeps inner blank lines and drops trailing ones', () => {
        const definition = parseFlowDiagram(
            source(
                'scenario "Only"',
                'A --> B',
                'mermaid:',
                '    flowchart LR',
                '',
                '        A --> B',
                '',
                ''
            )
        );

        expect(definition.scenarios[0].mermaid).toBe(
            'flowchart LR\n\n    A --> B'
        );
    });

    it('ends the block at the first line indented no further than it', () => {
        const definition = parseFlowDiagram(
            source('scenario "Only"', 'mermaid:', '    flowchart LR', 'A --> B')
        );

        expect(definition.scenarios[0].mermaid).toBe('flowchart LR');
        expect(definition.scenarios[0].edgeIds).toEqual(['a--b']);
    });

    it('ignores a block with no content', () => {
        const definition = parseFlowDiagram(
            source('scenario "Only"', 'A --> B', 'mermaid:')
        );

        expect(definition.scenarios[0].mermaid).toBeUndefined();
    });
});

describe('FlowDiagramParseError', () => {
    it('names the line number and quotes the trimmed offending line', () => {
        const error = parseError(
            source('scenario "Only"', 'A --> B', '   A --> B --> C   ')
        );

        expect(error.name).toBe('FlowDiagramParseError');
        expect(error.message).toBe(
            'line 3: a hop must have exactly one "-->"\n  A --> B --> C'
        );
    });
});
