import type {
    FlowEdgeSpec,
    FlowNodeSpec,
    FlowScenario,
    FlowView,
} from '@/components/pages/articles/FlowDiagram/types';

// The two strips of prose under a diagram: the hint describing its controls, and
// the caption describing whatever the reader last touched. Pure functions of the
// current state, so they live here rather than in the component: each is a small
// decision table, and written inline they were nested ternaries that hid which
// branch actually ran.

/**
 * What the reader is told they can do. Deliberately describes the controls and
 * never the diagram's subject: wording tied to one diagram's story goes stale the
 * moment another is added.
 */
export function resolveHint(
    view: FlowView,
    hasScenarioChoice: boolean
): string {
    if (view === 'static') {
        if (hasScenarioChoice) {
            return 'Switch scenarios, or press Interactive to step through the diagram.';
        }
        return 'Press Interactive to step through the diagram a piece at a time.';
    }
    if (hasScenarioChoice) {
        return 'Switch scenarios, step through the diagram, or select a box to see what it does.';
    }
    return 'Step through the diagram, or select a box to see what it does.';
}

/** A short label for where the text came from, plus the text. */
export interface FlowCaptionContent {
    source: string;
    text: string;
}

interface CaptionInput {
    view: FlowView;
    scenario: FlowScenario;
    /** The box the reader selected, if it has anything to say. */
    selectedNode: FlowNodeSpec | undefined;
    isStepping: boolean;
    /** The hop the reader has stepped to, if it carries a caption. */
    activeHop: FlowEdgeSpec | undefined;
    /** Already clamped to the scenario's hop count by the caller. */
    stepIndex: number;
}

/**
 * What the caption says, in priority order: the scenario summary is the resting
 * text, a selected box outranks it, and a stepped hop outranks that only while
 * stepping. The static view has no steps or selection, so it always rests.
 */
export function resolveCaption({
    view,
    scenario,
    selectedNode,
    isStepping,
    activeHop,
    stepIndex,
}: CaptionInput): FlowCaptionContent {
    const scenarioCaption = {
        source: scenario.label,
        text: scenario.summary ?? '',
    };

    if (view === 'static') return scenarioCaption;
    if (selectedNode?.description) {
        return { source: selectedNode.label, text: selectedNode.description };
    }
    if (isStepping && activeHop?.caption) {
        return { source: `Step ${stepIndex + 1}`, text: activeHop.caption };
    }
    return scenarioCaption;
}
