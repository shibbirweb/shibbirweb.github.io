import { describe, expect, it } from 'vitest';
import {
    resolveCaption,
    resolveHint,
} from '@/components/pages/articles/FlowDiagram/captions';
import type {
    FlowEdgeSpec,
    FlowNodeSpec,
    FlowScenario,
} from '@/components/pages/articles/FlowDiagram/types';

const scenario: FlowScenario = {
    id: 'vpn-on',
    label: 'VPN on',
    summary: 'Every DNS question goes through the tunnel.',
    edgeIds: ['phone--router'],
};

const describedNode: FlowNodeSpec = {
    id: 'router',
    label: 'Router',
    description: 'Hands out addresses.',
};

const captionedHop: FlowEdgeSpec = {
    id: 'phone--router',
    source: 'phone',
    target: 'router',
    caption: 'The phone asks the router.',
};

const scenarioCaption = {
    source: 'VPN on',
    text: 'Every DNS question goes through the tunnel.',
};

describe('resolveHint', () => {
    it('mentions scenarios in the static view only when there is a choice', () => {
        expect(resolveHint('static', true)).toBe(
            'Switch scenarios, or press Interactive to step through the diagram.'
        );
        expect(resolveHint('static', false)).toBe(
            'Press Interactive to step through the diagram a piece at a time.'
        );
    });

    it('describes stepping and selecting in the interactive view', () => {
        expect(resolveHint('interactive', true)).toBe(
            'Switch scenarios, step through the diagram, or select a box to see what it does.'
        );
        expect(resolveHint('interactive', false)).toBe(
            'Step through the diagram, or select a box to see what it does.'
        );
    });
});

describe('resolveCaption', () => {
    it('rests on the scenario summary', () => {
        expect(
            resolveCaption({
                view: 'interactive',
                scenario,
                selectedNode: undefined,
                isStepping: false,
                activeHop: undefined,
                stepIndex: 0,
            })
        ).toEqual(scenarioCaption);
    });

    it('uses empty text when the scenario has no summary', () => {
        expect(
            resolveCaption({
                view: 'static',
                scenario: { id: 'bare', label: 'Bare', edgeIds: [] },
                selectedNode: undefined,
                isStepping: false,
                activeHop: undefined,
                stepIndex: 0,
            })
        ).toEqual({ source: 'Bare', text: '' });
    });

    it('always rests in the static view, even with a selection or step', () => {
        expect(
            resolveCaption({
                view: 'static',
                scenario,
                selectedNode: describedNode,
                isStepping: true,
                activeHop: captionedHop,
                stepIndex: 2,
            })
        ).toEqual(scenarioCaption);
    });

    it('shows a selected node description over the scenario summary', () => {
        expect(
            resolveCaption({
                view: 'interactive',
                scenario,
                selectedNode: describedNode,
                isStepping: false,
                activeHop: undefined,
                stepIndex: 0,
            })
        ).toEqual({ source: 'Router', text: 'Hands out addresses.' });
    });

    it('lets a selected node outrank the stepped hop', () => {
        expect(
            resolveCaption({
                view: 'interactive',
                scenario,
                selectedNode: describedNode,
                isStepping: true,
                activeHop: captionedHop,
                stepIndex: 0,
            })
        ).toEqual({ source: 'Router', text: 'Hands out addresses.' });
    });

    it('ignores a selected node that has nothing to say', () => {
        expect(
            resolveCaption({
                view: 'interactive',
                scenario,
                selectedNode: { id: 'quiet', label: 'Quiet' },
                isStepping: false,
                activeHop: undefined,
                stepIndex: 0,
            })
        ).toEqual(scenarioCaption);
    });

    it('shows the stepped hop caption, numbered from one, while stepping', () => {
        expect(
            resolveCaption({
                view: 'interactive',
                scenario,
                selectedNode: undefined,
                isStepping: true,
                activeHop: captionedHop,
                stepIndex: 2,
            })
        ).toEqual({ source: 'Step 3', text: 'The phone asks the router.' });
    });

    it('ignores the hop caption when not stepping', () => {
        expect(
            resolveCaption({
                view: 'interactive',
                scenario,
                selectedNode: undefined,
                isStepping: false,
                activeHop: captionedHop,
                stepIndex: 0,
            })
        ).toEqual(scenarioCaption);
    });

    it('falls back to the summary when the stepped hop has no caption', () => {
        expect(
            resolveCaption({
                view: 'interactive',
                scenario,
                selectedNode: undefined,
                isStepping: true,
                activeHop: { id: 'a--b', source: 'a', target: 'b' },
                stepIndex: 0,
            })
        ).toEqual(scenarioCaption);
    });
});
