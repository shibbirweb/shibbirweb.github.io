import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
    DIAGRAM_IMAGE_DIRECTORY,
    DIAGRAM_IMAGE_MAX_WIDTH,
    DIAGRAM_IMAGE_SCALE,
    collectDiagramImages,
    diagramImageFilePath,
    readPngSize,
} from '@/lib/diagramImages';
import {
    ARTICLES_DIRECTORY,
    markdownFilesIn,
    readText,
} from '@tests/content/markdownFences';

// Every article diagram ships a pre-rendered PNG for browser reading modes (see
// src/lib/diagramImages.ts). The PNGs are committed rather than built, so these
// checks catch a diagram added or edited without running `pnpm gen:diagrams`.

/** Room the generator leaves around a diagram, plus rounding, in CSS px. */
const FRAME_ALLOWANCE = 2 * 24 + 2;

const diagrams = markdownFilesIn(ARTICLES_DIRECTORY).flatMap((fileName) =>
    collectDiagramImages(readText(ARTICLES_DIRECTORY, fileName)).map(
        (image) => ({ ...image, location: `content/articles/${fileName}` })
    )
);

const committedPngs = fs.existsSync(DIAGRAM_IMAGE_DIRECTORY)
    ? fs
          .readdirSync(DIAGRAM_IMAGE_DIRECTORY)
          .filter((name) => name.endsWith('.png'))
    : [];

describe('diagram images for reading modes', () => {
    it('finds diagrams to check', () => {
        expect(diagrams.length).toBeGreaterThan(0);
    });

    for (const diagram of diagrams) {
        it(`${diagram.location} "${diagram.alt}" has an up-to-date PNG (run pnpm gen:diagrams)`, () => {
            const filePath = diagramImageFilePath(diagram.key);

            expect(fs.existsSync(filePath), filePath).toBe(true);
            const size = readPngSize(fs.readFileSync(filePath));
            expect(size, `${filePath} is not a PNG`).not.toBeNull();
            expect(size!.width / DIAGRAM_IMAGE_SCALE).toBeLessThanOrEqual(
                DIAGRAM_IMAGE_MAX_WIDTH + FRAME_ALLOWANCE
            );
        });
    }

    it('keeps no PNG that no article uses (run pnpm gen:diagrams)', () => {
        const usedPngs = new Set(
            diagrams.map((diagram) => `${diagram.key}.png`)
        );

        expect(committedPngs.filter((name) => !usedPngs.has(name))).toEqual([]);
    });
});
