import { describe, expect, it } from 'vitest';
import {
    ESTIMATED_NODE_SIZE,
    layoutFlow,
    type NodeSize,
} from '@/components/pages/articles/FlowDiagram/layout';
import { parseFlowDiagram } from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';
import type {
    FlowEdgeSpec,
    FlowNodeSpec,
} from '@/components/pages/articles/FlowDiagram/types';

function nodesNamed(...ids: string[]): FlowNodeSpec[] {
    return ids.map((id) => ({ id, label: id }));
}

function hop(source: string, target: string): FlowEdgeSpec {
    return { id: `${source}--${target}`, source, target };
}

describe('layoutFlow', () => {
    it('returns a position for every node across the union of scenarios', () => {
        const definition = parseFlowDiagram(
            [
                'Standalone',
                'scenario "Router-wide"',
                'Phone --> Router',
                'Router --> Pi-hole',
                'scenario "VPN"',
                'Phone --> wg-easy',
                'wg-easy --> Pi-hole',
            ].join('\n')
        );

        const positions = layoutFlow(
            definition.nodes,
            definition.edges,
            new Map()
        );

        expect([...positions.keys()].sort()).toEqual(
            definition.nodes.map((node) => node.id).sort()
        );
        for (const position of positions.values()) {
            expect(Number.isFinite(position.x)).toBe(true);
            expect(Number.isFinite(position.y)).toBe(true);
        }
    });

    it('ranks a chain of hops from left to right', () => {
        const positions = layoutFlow(
            nodesNamed('a', 'b', 'c'),
            [hop('a', 'b'), hop('b', 'c')],
            new Map()
        );

        const a = positions.get('a')!;
        const b = positions.get('b')!;
        const c = positions.get('c')!;
        expect(b.x).toBeGreaterThan(a.x + ESTIMATED_NODE_SIZE.width);
        expect(c.x).toBeGreaterThan(b.x + ESTIMATED_NODE_SIZE.width);
    });

    it('stacks siblings in one rank without overlapping them', () => {
        const positions = layoutFlow(
            nodesNamed('root', 'upper', 'lower'),
            [hop('root', 'upper'), hop('root', 'lower')],
            new Map()
        );

        const upper = positions.get('upper')!;
        const lower = positions.get('lower')!;
        expect(upper.x).toBe(lower.x);
        expect(Math.abs(upper.y - lower.y)).toBeGreaterThanOrEqual(
            ESTIMATED_NODE_SIZE.height
        );
    });

    it('reports top-left corners rather than centres', () => {
        const sizes = new Map<string, NodeSize>([
            ['only', { width: 100, height: 40 }],
        ]);

        const positions = layoutFlow(nodesNamed('only'), [], sizes);

        // A lone node sits at the graph margin, so its corner is the margin.
        expect(positions.get('only')).toEqual({ x: 8, y: 8 });
    });

    it('uses measured sizes when they are given', () => {
        const wide = new Map<string, NodeSize>([
            ['a', { width: 600, height: 40 }],
            ['b', { width: 100, height: 40 }],
        ]);

        const positions = layoutFlow(
            nodesNamed('a', 'b'),
            [hop('a', 'b')],
            wide
        );

        expect(positions.get('b')!.x).toBeGreaterThanOrEqual(
            positions.get('a')!.x + 600
        );
    });

    it('returns an empty map for an empty graph', () => {
        expect(layoutFlow([], [], new Map()).size).toBe(0);
    });
});
