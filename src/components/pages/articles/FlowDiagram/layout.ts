import dagre from '@dagrejs/dagre';
import type {
    FlowEdgeSpec,
    FlowNodeSpec,
} from '@/components/pages/articles/FlowDiagram/types';

// Automatic left-to-right layout, the thing the previous hand-rolled engine could
// not do. Positions are computed once from the *union* of every scenario's hops,
// never per scenario: a node keeps the same coordinates whichever scenario is
// showing, so toggling lights a different route instead of rearranging the page.

export interface NodeSize {
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

/**
 * Used before React Flow has measured the real boxes. Close to the old fixed node
 * size, so the first paint is roughly right and the corrected pass barely moves.
 */
export const ESTIMATED_NODE_SIZE: NodeSize = { width: 180, height: 68 };

/**
 * Breathing room left around the graph when the canvas fits it to the viewport.
 *
 * One value, because every fit has to agree: the initial one, the reset button and
 * the `0` key all claim to return the reader to the same view, and separate
 * literals would only look identical until one of them was tuned.
 */
export const FIT_VIEW_PADDING = 0.18;

/**
 * Runs dagre over the whole graph and returns each node's top-left corner.
 * dagre reports node centres, React Flow positions by corner, hence the offset.
 */
export function layoutFlow(
    nodes: FlowNodeSpec[],
    edges: FlowEdgeSpec[],
    sizes: Map<string, NodeSize>
): Map<string, Point> {
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({
        rankdir: 'LR',
        // Generous separation: these diagrams carry labels on their arrows, and a
        // tight rank gap leaves nowhere for that text to sit.
        nodesep: 44,
        ranksep: 96,
        marginx: 8,
        marginy: 8,
    });
    graph.setDefaultEdgeLabel(() => ({}));

    for (const node of nodes) {
        const size = sizes.get(node.id) ?? ESTIMATED_NODE_SIZE;
        graph.setNode(node.id, { width: size.width, height: size.height });
    }
    for (const edge of edges) {
        graph.setEdge(edge.source, edge.target);
    }

    dagre.layout(graph);

    const positions = new Map<string, Point>();
    for (const node of nodes) {
        const laidOut = graph.node(node.id);
        const size = sizes.get(node.id) ?? ESTIMATED_NODE_SIZE;
        if (!laidOut) {
            positions.set(node.id, { x: 0, y: 0 });
            continue;
        }
        positions.set(node.id, {
            x: laidOut.x - size.width / 2,
            y: laidOut.y - size.height / 2,
        });
    }
    return positions;
}
