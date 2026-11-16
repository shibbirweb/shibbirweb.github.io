import { describe, expect, it } from 'vitest';
import {
    describeNodeOnlyImport,
    directiveOf,
    findNodeOnlyImports,
    isNodeOnlyModule,
    resolveImport,
    runtimeImports,
    type SourceFiles,
} from '@tests/architecture/importGraph';

function sourceFiles(entries: Record<string, string>): SourceFiles {
    return new Map(Object.entries(entries));
}

describe('isNodeOnlyModule', () => {
    it('flags node: specifiers and bare Node built-ins', () => {
        expect(isNodeOnlyModule('node:fs')).toBe(true);
        expect(isNodeOnlyModule('fs')).toBe(true);
        expect(isNodeOnlyModule('fs/promises')).toBe(true);
        expect(isNodeOnlyModule('crypto')).toBe(true);
    });

    it('leaves packages and project paths alone', () => {
        expect(isNodeOnlyModule('react')).toBe(false);
        expect(isNodeOnlyModule('marked')).toBe(false);
        expect(isNodeOnlyModule('@/lib/markdown')).toBe(false);
    });
});

describe('directiveOf', () => {
    it('reads a directive on the first line', () => {
        expect(directiveOf("'use client';\nimport x from 'y';")).toBe(
            'use client'
        );
        expect(directiveOf('"use server";\n')).toBe('use server');
    });

    it('reads a directive below leading comments', () => {
        expect(directiveOf("// A comment\n/* more */\n'use client';\n")).toBe(
            'use client'
        );
    });

    it('returns null when there is no directive or it is not first', () => {
        expect(directiveOf("import x from 'y';\n'use client';\n")).toBeNull();
        expect(directiveOf('export const value = 1;\n')).toBeNull();
    });
});

describe('runtimeImports', () => {
    it('collects default, named, namespace, re-export and side-effect imports', () => {
        const source = [
            "import React from 'react';",
            "import { useState, useEffect } from 'react';",
            "import * as path from 'node:path';",
            'import {',
            '    renderMarkdown,',
            '    type TocItem,',
            "} from '@/lib/markdown';",
            "export { slugify } from '@/utils/slugify';",
            "export * from '@/lib/posts';",
            "import '@/app/globals.css';",
        ].join('\n');

        expect(runtimeImports(source)).toEqual([
            'react',
            'react',
            'node:path',
            '@/lib/markdown',
            '@/utils/slugify',
            '@/lib/posts',
            '@/app/globals.css',
        ]);
    });

    it('collects dynamic imports, as next/dynamic uses them', () => {
        const source =
            "const Canvas = dynamic(() => import('@/components/FlowCanvas'));";

        expect(runtimeImports(source)).toEqual(['@/components/FlowCanvas']);
    });

    it('skips imports TypeScript erases', () => {
        const source = [
            "import type { Metadata } from 'next';",
            "import { type ArticleSeries, type TocItem } from '@/lib/posts';",
            "export type { TocItem } from '@/lib/markdown';",
        ].join('\n');

        expect(runtimeImports(source)).toEqual([]);
    });

    it('does not read across an unrelated statement into a later import', () => {
        const source = [
            'export const limit = 3;',
            "import { marked } from 'marked';",
        ].join('\n');

        expect(runtimeImports(source)).toEqual(['marked']);
    });
});

describe('resolveImport', () => {
    const files = sourceFiles({
        'src/lib/markdown.ts': '',
        'src/components/Card/index.tsx': '',
        'src/components/Card/Card.module.css': '',
    });

    it('maps @/ to src/ and finds the extension or folder index', () => {
        expect(resolveImport('@/lib/markdown', 'src/app/page.tsx', files)).toBe(
            'src/lib/markdown.ts'
        );
        expect(
            resolveImport('@/components/Card', 'src/app/page.tsx', files)
        ).toBe('src/components/Card/index.tsx');
    });

    it('resolves relative paths against the importing file', () => {
        expect(
            resolveImport('../lib/markdown', 'src/app/page.tsx', files)
        ).toBe('src/lib/markdown.ts');
    });

    it('returns null for packages and for paths outside the map', () => {
        expect(resolveImport('react', 'src/app/page.tsx', files)).toBeNull();
        expect(
            resolveImport('@/lib/missing', 'src/app/page.tsx', files)
        ).toBeNull();
    });
});

describe('findNodeOnlyImports', () => {
    it('finds node:fs two hops below a client component, with the chain', () => {
        // The shape of the bug from b29e9eb: the article editor's live preview
        // rendered Markdown in the browser, and the Markdown module had started
        // importing a helper that reads PNGs from disk.
        const files = sourceFiles({
            'src/components/EditorPreview.tsx':
                "'use client';\nimport { renderMarkdown } from '@/lib/markdown';\n",
            'src/lib/markdown.ts':
                "import { diagramImageTag } from '@/lib/diagramImages';\n",
            'src/lib/diagramImages.ts': "import fs from 'node:fs';\n",
        });

        const findings = findNodeOnlyImports(
            ['src/components/EditorPreview.tsx'],
            files
        );

        expect(findings.map(describeNodeOnlyImport)).toEqual([
            'src/components/EditorPreview.tsx -> src/lib/markdown.ts -> src/lib/diagramImages.ts imports node:fs',
        ]);
    });

    it('follows dynamic imports too', () => {
        const files = sourceFiles({
            'src/components/Diagram.tsx':
                "'use client';\nconst Canvas = dynamic(() => import('@/components/Canvas'));\n",
            'src/components/Canvas.tsx': "import path from 'path';\n",
        });

        expect(
            findNodeOnlyImports(['src/components/Diagram.tsx'], files)
        ).toEqual([
            {
                chain: [
                    'src/components/Diagram.tsx',
                    'src/components/Canvas.tsx',
                ],
                specifier: 'path',
            },
        ]);
    });

    it('stops at a use server module, whose code never reaches the browser', () => {
        const files = sourceFiles({
            'src/components/SaveButton.tsx':
                "'use client';\nimport { saveArticle } from '@/app/actions';\n",
            'src/app/actions.ts': "'use server';\nimport fs from 'node:fs';\n",
        });

        expect(
            findNodeOnlyImports(['src/components/SaveButton.tsx'], files)
        ).toEqual([]);
    });

    it('ignores Node-only imports that are type-only', () => {
        const files = sourceFiles({
            'src/components/Thing.tsx':
                "'use client';\nimport type { Stats } from 'node:fs';\n",
        });

        expect(
            findNodeOnlyImports(['src/components/Thing.tsx'], files)
        ).toEqual([]);
    });

    it('visits a shared module once even when many entries reach it', () => {
        const files = sourceFiles({
            'src/components/A.tsx': "'use client';\nimport '@/lib/shared';\n",
            'src/components/B.tsx': "'use client';\nimport '@/lib/shared';\n",
            'src/lib/shared.ts': "import os from 'node:os';\n",
        });

        expect(
            findNodeOnlyImports(
                ['src/components/A.tsx', 'src/components/B.tsx'],
                files
            )
        ).toHaveLength(1);
    });
});
