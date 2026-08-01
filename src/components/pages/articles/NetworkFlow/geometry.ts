import type {
    NetworkFlowEdge,
    NetworkFlowNode,
} from '@/components/pages/articles/NetworkFlow/types';

// Pure layout maths for the network-flow SVG. Nodes sit on a fixed column/row
// grid so every scenario of a diagram lines up with the others, which is what
// makes toggling between them read as "the same picture, a different route"
// rather than a redraw.

export const NODE_WIDTH = 168;
export const NODE_HEIGHT = 66;

const COLUMN_PITCH = 236;
const ROW_PITCH = 126;

/**
 * Room a label on a straight, same-row hop has before a node paints over it.
 * Nodes are drawn after edges, so a label wider than the gap between two columns
 * is silently covered by the box it runs into. Keep labels on straight hops short,
 * and put longer detail in the node itself where there is width to spare.
 */
export const SAME_ROW_LABEL_SPACE = COLUMN_PITCH - NODE_WIDTH;
const MARGIN_X = 14;
const MARGIN_Y = 14;

const COLUMN_COUNT = 4;
const ROW_COUNT = 3;

export const VIEW_BOX_WIDTH =
    MARGIN_X * 2 + NODE_WIDTH + COLUMN_PITCH * (COLUMN_COUNT - 1);
export const VIEW_BOX_HEIGHT =
    MARGIN_Y * 2 + NODE_HEIGHT + ROW_PITCH * (ROW_COUNT - 1);

export interface Point {
    x: number;
    y: number;
}

/** Top-left corner of a node's box in SVG user units. */
export function nodeOrigin(node: NetworkFlowNode): Point {
    return {
        x: MARGIN_X + node.column * COLUMN_PITCH,
        y: MARGIN_Y + node.row * ROW_PITCH,
    };
}

/** Where an arrow leaves a node: the middle of its right edge. */
function exitPoint(node: NetworkFlowNode): Point {
    const { x, y } = nodeOrigin(node);
    return { x: x + NODE_WIDTH, y: y + NODE_HEIGHT / 2 };
}

/** Where an arrow lands on a node: the middle of its left edge. */
function entryPoint(node: NetworkFlowNode): Point {
    const { x, y } = nodeOrigin(node);
    return { x, y: y + NODE_HEIGHT / 2 };
}

/**
 * The `d` for one edge. Same-row hops are a straight line; hops that change row
 * bend through a horizontal-tangent cubic, so arrows leave and arrive level with
 * the boxes instead of cutting across them at an angle.
 */
export function edgePathData(
    from: NetworkFlowNode,
    to: NetworkFlowNode
): string {
    const start = exitPoint(from);
    const end = entryPoint(to);
    if (start.y === end.y) {
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }
    const controlOffset = (end.x - start.x) / 2;
    return (
        `M ${start.x} ${start.y} ` +
        `C ${start.x + controlOffset} ${start.y}, ` +
        `${end.x - controlOffset} ${end.y}, ` +
        `${end.x} ${end.y}`
    );
}

/** Roughly the middle of an edge, used to place its label and the resting dot. */
export function edgeMidpoint(
    from: NetworkFlowNode,
    to: NetworkFlowNode
): Point {
    const start = exitPoint(from);
    const end = entryPoint(to);
    return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
    };
}

/** Indexes a scenario's nodes by id so edges can resolve their endpoints. */
export function nodesById(
    nodes: NetworkFlowNode[]
): Map<string, NetworkFlowNode> {
    return new Map(nodes.map((node) => [node.id, node]));
}

/** True when an edge starts or ends at the given node. */
export function edgeTouchesNode(edge: NetworkFlowEdge, nodeId: string): boolean {
    return edge.from === nodeId || edge.to === nodeId;
}
