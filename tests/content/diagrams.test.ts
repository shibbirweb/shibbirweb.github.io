// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest';
import { parseFlowDiagram } from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';
import { toMermaid } from '@/components/pages/articles/FlowDiagram/toMermaid';
import {
    ARTICLES_DIRECTORY,
    WIKI_DIRECTORY,
    markdownFilesIn,
    readText,
    scanMarkdown,
} from '@tests/content/markdownFences';

// A mermaid diagram that fails to parse degrades silently to a plain <pre> on the
// page (see useMermaidSvg), so every diagram the site ships is parsed here.

type Mermaid = (typeof import('mermaid'))['default'];

interface DiagramCase {
    name: string;
    source: string;
}

function fencesIn(directory: string, relativeDirectory: string) {
    return markdownFilesIn(directory).flatMap((fileName) =>
        scanMarkdown(readText(directory, fileName)).fences.map((fence) => ({
            ...fence,
            location: `${relativeDirectory}/${fileName}:${fence.lineNumber}`,
        }))
    );
}

const allFences = [
    ...fencesIn(ARTICLES_DIRECTORY, 'content/articles'),
    ...fencesIn(WIKI_DIRECTORY, 'docs/wiki'),
];

const mermaidFenceCases: DiagramCase[] = allFences
    .filter((fence) => fence.language === 'mermaid')
    .map((fence) => ({ name: fence.location, source: fence.body }));

const reactflowFences = allFences
    .filter((fence) => fence.language === 'reactflow')
    .map((fence) => ({
        location: fence.location,
        definition: parseFlowDiagram(fence.body),
    }));

const handWrittenCases: DiagramCase[] = reactflowFences.flatMap(
    ({ location, definition }) => {
        const scenarioBlocks = definition.scenarios
            .filter((scenario) => scenario.mermaid !== undefined)
            .map((scenario) => ({
                name: `${location} scenario "${scenario.label}" mermaid block`,
                source: scenario.mermaid as string,
            }));
        if (definition.mermaid === undefined) {
            return scenarioBlocks;
        }
        return [
            {
                name: `${location} diagram-level mermaid block`,
                source: definition.mermaid,
            },
            ...scenarioBlocks,
        ];
    }
);

const generatedCases: DiagramCase[] = reactflowFences.flatMap(
    ({ location, definition }) =>
        definition.scenarios.map((scenario) => ({
            name: `${location} scenario "${scenario.label}" generated`,
            source: toMermaid(definition, scenario),
        }))
);

/**
 * Importing mermaid is the slow part of this file (well under a second alone,
 * but it can pass the default 10s hook limit when the whole suite runs at once).
 */
const MERMAID_IMPORT_TIMEOUT_MS = 60_000;

let mermaid: Mermaid;

beforeAll(async () => {
    mermaid = (await import('mermaid')).default;
    mermaid.initialize({ startOnLoad: false });
}, MERMAID_IMPORT_TIMEOUT_MS);

describe('mermaid diagrams in content', () => {
    it('finds diagrams to check', () => {
        expect(mermaidFenceCases.length).toBeGreaterThan(0);
        expect(reactflowFences.length).toBeGreaterThan(0);
    });

    it('rejects a broken diagram, so the checks below can fail', async () => {
        await expect(
            mermaid.parse('flowchart LR\n    A -->|unclosed label B')
        ).rejects.toThrow();
    });

    describe('```mermaid fences', () => {
        for (const { name, source } of mermaidFenceCases) {
            it(`${name} parses`, async () => {
                await expect(mermaid.parse(source)).resolves.toBeTruthy();
            });
        }
    });

    describe('mermaid: blocks inside reactflow fences', () => {
        for (const { name, source } of handWrittenCases) {
            it(`${name} parses`, async () => {
                await expect(mermaid.parse(source)).resolves.toBeTruthy();
            });
        }
    });

    describe('mermaid generated from reactflow scenarios', () => {
        for (const { name, source } of generatedCases) {
            it(`${name} parses`, async () => {
                await expect(mermaid.parse(source)).resolves.toBeTruthy();
            });
        }
    });
});
