import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    describeNodeOnlyImport,
    directiveOf,
    findNodeOnlyImports,
    type SourceFiles,
} from '@tests/architecture/importGraph';

// Guards the browser bundle: no 'use client' module may reach a Node-only module
// (node:fs, node:crypto, ...) through its imports. If one does, Next fails to
// compile that route, and the failure is invisible to every other suite: unit
// tests run in Node, where the import works, and dev-only routes such as the
// article editor never reach `pnpm build`, the browser tests or Lighthouse.
// Keep Node-only code behind a server file, or plug it in from server code (see
// setDiagramFallbackImageRenderer in src/lib/markdown.ts).

const SOURCE_DIRECTORY = 'src';
const SOURCE_FILE_PATTERN = /\.(ts|tsx|js|jsx|mjs)$/;
const TEST_FILE_PATTERN = /\.test\.(ts|tsx)$/;

function readSourceFiles(): SourceFiles {
    const files: SourceFiles = new Map();
    const entries = fs.readdirSync(path.join(process.cwd(), SOURCE_DIRECTORY), {
        recursive: true,
        withFileTypes: true,
    });
    for (const entry of entries) {
        if (!entry.isFile() || !SOURCE_FILE_PATTERN.test(entry.name)) {
            continue;
        }
        if (
            TEST_FILE_PATTERN.test(entry.name) ||
            entry.name.endsWith('.d.ts')
        ) {
            continue;
        }
        const absolutePath = path.join(entry.parentPath, entry.name);
        const repoPath = path
            .relative(process.cwd(), absolutePath)
            .split(path.sep)
            .join('/');
        files.set(repoPath, fs.readFileSync(absolutePath, 'utf8'));
    }
    return files;
}

const sourceFiles = readSourceFiles();
const clientEntries = [...sourceFiles.keys()].filter(
    (file) => directiveOf(sourceFiles.get(file) ?? '') === 'use client'
);

describe('client bundle imports', () => {
    it('finds the client components to check', () => {
        // A sanity floor, so a broken directive check cannot pass by finding nothing.
        expect(clientEntries.length).toBeGreaterThan(50);
        expect(clientEntries).toContain(
            'src/components/pages/article-editor/ArticleEditor/EditorPreview.tsx'
        );
    });

    it('never pulls a Node-only module into a use client module', () => {
        const findings = findNodeOnlyImports(clientEntries, sourceFiles);

        expect(findings.map(describeNodeOnlyImport)).toEqual([]);
    });
});
