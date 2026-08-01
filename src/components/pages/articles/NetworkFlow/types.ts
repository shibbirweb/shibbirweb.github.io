// The shape of an interactive network-flow diagram, shared by the scenario data
// in `contents.ts`, the geometry helpers, and the SVG components. Pure types with
// no runtime import, so both server and client code can read them.

/**
 * How a node or edge is coloured. `secure` marks the encrypted leg of a tunnel,
 * `blocked` an answer that deliberately goes nowhere, and `allowed` a normal
 * successful lookup.
 */
export type NetworkFlowTone = 'neutral' | 'secure' | 'blocked' | 'allowed';

/** One box in the diagram, placed on a fixed column/row grid. */
export interface NetworkFlowNode {
    id: string;
    /** Primary line inside the box. */
    label: string;
    /** Optional second line, typically an address. */
    detail?: string;
    /** Shown in the caption when the reader selects this node. */
    description: string;
    column: number;
    row: number;
    tone?: NetworkFlowTone;
}

/** One arrow between two nodes, and the step-mode explanation for that hop. */
export interface NetworkFlowEdge {
    from: string;
    to: string;
    /** Optional short text drawn along the arrow. */
    label?: string;
    /** Shown in the caption while stepping through this hop. */
    caption: string;
    tone?: NetworkFlowTone;
}

/** One switchable state of the diagram, for example "VPN off" against "VPN on". */
export interface NetworkFlowScenario {
    id: string;
    /** Text on the scenario toggle button. */
    label: string;
    /** Caption shown at rest, before the reader selects a node or steps a hop. */
    summary: string;
    nodes: NetworkFlowNode[];
    edges: NetworkFlowEdge[];
}

/** A complete diagram: the set of scenarios a single `netflow` block can show. */
export interface NetworkFlowDefinition {
    id: string;
    /** Accessible name for the diagram as a whole. */
    title: string;
    scenarios: NetworkFlowScenario[];
}
