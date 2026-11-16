import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    DIAGRAM_FALLBACK_IMAGE_CLASS,
    DIAGRAM_IMAGE_DIRECTORY,
    collectDiagramImages,
    diagramImageFilePath,
    diagramImageFor,
    diagramImageKey,
    diagramImageTag,
    diagramImageUrl,
    readPngSize,
} from '@/lib/diagramImages';
import { parseFlowDiagram } from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';
import { flowMermaidSource } from '@/components/pages/articles/FlowDiagram/toMermaid';
import { fakeFileOnDisk, pngHeader } from '@tests/helpers/fakeDiagramImage';

const MERMAID_SOURCE = [
    'flowchart LR',
    '    accTitle: Phone to router',
    '    Phone --> Router',
].join('\n');

const FLOW_SOURCE = [
    'title: Phone to Pi-hole',
    'scenario "Router-wide"',
    'Phone --> Pi-hole (DNS query)',
    'scenario "Phone only"',
    'Phone --> Router (DNS query)',
].join('\n');

function mermaidImage() {
    const image = diagramImageFor('mermaid', MERMAID_SOURCE);
    if (!image) {
        throw new Error('expected a diagram image');
    }
    return image;
}

describe('diagramImageKey', () => {
    it('is a stable 16 character hex hash of the source', () => {
        const key = diagramImageKey(MERMAID_SOURCE);

        expect(key).toMatch(/^[0-9a-f]{16}$/);
        expect(diagramImageKey(MERMAID_SOURCE)).toBe(key);
    });

    it('changes when the source changes', () => {
        expect(diagramImageKey('flowchart LR\n    A --> B')).not.toBe(
            diagramImageKey('flowchart LR\n    A --> C')
        );
    });
});

describe('diagramImageFor', () => {
    it('draws a mermaid block from its own source, named by its accTitle', () => {
        expect(diagramImageFor('mermaid', MERMAID_SOURCE)).toEqual({
            key: diagramImageKey(MERMAID_SOURCE),
            mermaidSource: MERMAID_SOURCE,
            alt: 'Diagram: Phone to router',
        });
    });

    it('falls back to a plain alt when a mermaid block has no accTitle', () => {
        expect(diagramImageFor('mermaid', 'flowchart LR\n    A --> B')).toEqual(
            expect.objectContaining({ alt: 'Diagram' })
        );
    });

    it('draws a reactflow block as its first scenario, named by its title', () => {
        const definition = parseFlowDiagram(FLOW_SOURCE);
        const firstScenarioSource = flowMermaidSource(
            definition,
            definition.scenarios[0]
        );

        expect(diagramImageFor('reactflow', FLOW_SOURCE)).toEqual({
            key: diagramImageKey(firstScenarioSource),
            mermaidSource: firstScenarioSource,
            alt: 'Diagram: Phone to Pi-hole',
        });
    });

    it('names an untitled reactflow block by its first scenario', () => {
        const source = FLOW_SOURCE.split('\n').slice(1).join('\n');

        expect(diagramImageFor('reactflow', source)?.alt).toBe(
            'Diagram: Router-wide'
        );
    });

    it('returns null for a reactflow block that does not parse', () => {
        expect(
            diagramImageFor('reactflow', '> prose with nothing to describe')
        ).toBeNull();
    });

    it('returns null for any other language', () => {
        expect(diagramImageFor('ts', 'const answer = 42;')).toBeNull();
    });
});

describe('collectDiagramImages', () => {
    it('lists every diagram in document order, nested ones included', () => {
        const markdown = [
            '## Setup',
            '```reactflow',
            FLOW_SOURCE,
            '```',
            '```ts',
            'const answer = 42;',
            '```',
            '> A quoted diagram:',
            '>',
            '> ```mermaid',
            ...MERMAID_SOURCE.split('\n').map((line) => `> ${line}`),
            '> ```',
        ].join('\n');

        expect(
            collectDiagramImages(markdown).map((image) => image.alt)
        ).toEqual(['Diagram: Phone to Pi-hole', 'Diagram: Phone to router']);
    });

    it('skips a reactflow block that does not parse', () => {
        expect(
            collectDiagramImages(
                '```reactflow\n> prose with nothing to describe\n```'
            )
        ).toEqual([]);
    });
});

describe('diagram image paths', () => {
    it('keeps the PNG under public/diagrams, served from /diagrams', () => {
        expect(diagramImageFilePath('abc')).toBe(
            path.join(DIAGRAM_IMAGE_DIRECTORY, 'abc.png')
        );
        expect(DIAGRAM_IMAGE_DIRECTORY).toBe(
            path.join(process.cwd(), 'public/diagrams')
        );
        expect(diagramImageUrl('abc')).toBe('/diagrams/abc.png');
    });
});

describe('readPngSize', () => {
    it('reads the pixel size from the IHDR chunk', () => {
        expect(readPngSize(pngHeader(1424, 600))).toEqual({
            width: 1424,
            height: 600,
        });
    });

    it('returns null for bytes that are not a PNG', () => {
        expect(
            readPngSize(Buffer.from('GIF89a and then some more bytes'))
        ).toBe(null);
        expect(readPngSize(pngHeader(10, 10).subarray(0, 20))).toBeNull();
    });
});

describe('diagramImageTag', () => {
    it('is empty until the PNG has been generated', () => {
        expect(diagramImageTag({ ...mermaidImage(), key: 'not-drawn' })).toBe(
            ''
        );
    });

    it('is empty when the file on disk is not a PNG', () => {
        const image = mermaidImage();
        fakeFileOnDisk(
            diagramImageFilePath(image.key),
            Buffer.from('not an image at all, just text')
        );

        expect(diagramImageTag(image)).toBe('');
    });

    it('is a hidden, lazy image at half the PNG size', () => {
        const image = mermaidImage();
        fakeFileOnDisk(diagramImageFilePath(image.key), pngHeader(801, 400));

        expect(diagramImageTag(image)).toBe(
            `<img class="${DIAGRAM_FALLBACK_IMAGE_CLASS}" ` +
                `src="/diagrams/${image.key}.png" alt="Diagram: Phone to router" ` +
                'width="401" height="200" loading="lazy" decoding="async" ' +
                'aria-hidden="true">'
        );
    });

    it('escapes the alt text', () => {
        const image = { ...mermaidImage(), alt: 'Diagram: "A" & <B>' };
        fakeFileOnDisk(diagramImageFilePath(image.key), pngHeader(20, 20));

        expect(diagramImageTag(image)).toContain(
            'alt="Diagram: &quot;A&quot; &amp; &lt;B&gt;"'
        );
    });

    it('keeps "fallback-image" in its class, which Readability keeps visible', () => {
        expect(DIAGRAM_FALLBACK_IMAGE_CLASS).toContain('fallback-image');
    });
});
