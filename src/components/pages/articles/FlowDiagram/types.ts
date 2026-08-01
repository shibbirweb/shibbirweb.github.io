// The shape a `reactflow` fence parses into, shared by the parser, the dagre
// layout, and the React Flow components. Pure types with no runtime import, so
// server and client code can both read them.

/**
 * How a node or edge is coloured. `secure` marks an encrypted leg, `blocked` an
 * answer that deliberately goes nowhere, and `allowed` a normal successful hop.
 */
export type FlowTone = 'neutral' | 'secure' | 'blocked' | 'allowed';

export const FLOW_TONES: FlowTone[] = [
    'neutral',
    'secure',
    'blocked',
    'allowed',
];

/** One box. Ids are slugified from the declared name, so edges can use the name. */
export interface FlowNodeSpec {
    id: string;
    label: string;
    /** Optional second line, typically an address. */
    detail?: string;
    /** Shown in the caption when the reader selects this node. */
    description?: string;
    tone?: FlowTone;
}

/** One arrow. Identified by its endpoints, so scenarios can share a hop. */
export interface FlowEdgeSpec {
    id: string;
    source: string;
    target: string;
    /** Short text drawn on the arrow. */
    label?: string;
    /** Shown in the caption while stepping through this hop. */
    caption?: string;
    tone?: FlowTone;
}

/**
 * One switchable state. Scenarios name the hops they route through rather than
 * owning nodes: every scenario of a diagram draws the same node set, so toggling
 * changes which route is lit rather than rearranging the picture.
 */
export interface FlowScenario {
    id: string;
    label: string;
    summary?: string;
    edgeIds: string[];
    /** Hand-written mermaid for this scenario's static view. */
    mermaid?: string;
}

/** Which of the two renderings a diagram opens on. */
export type FlowView = 'static' | 'interactive';

/** A whole `reactflow` block. Nodes and edges are the union across scenarios. */
export interface FlowDiagramDefinition {
    /** Accessible name for the canvas. */
    title?: string;
    /**
     * Which view the reader gets first, from a `default:` line. Defaults to
     * `static`, so the heavy React Flow chunk is only fetched by readers who ask
     * for the interactive version.
     */
    defaultView?: FlowView;
    /**
     * Whether packets travel the hops in the interactive view, from a `packets:`
     * line. Defaults to on. Structural diagrams (a commit history, say) want it
     * off: nothing actually moves between two commits, so a travelling dot would
     * assert something untrue.
     */
    showPackets?: boolean;
    /**
     * Hand-written mermaid declared before any scenario, used as the static view
     * for every scenario that does not supply its own.
     */
    mermaid?: string;
    nodes: FlowNodeSpec[];
    edges: FlowEdgeSpec[];
    scenarios: FlowScenario[];
}
