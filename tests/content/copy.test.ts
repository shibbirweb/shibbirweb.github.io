import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    WIKI_DIRECTORY,
    markdownFilesIn,
    readText,
} from '@tests/content/markdownFences';

// Project-wide copy rules: the em dash ban from CLAUDE.md, and the wiki's own
// house rules (short pages, links that go somewhere).

// Built from its code point so this file never contains the character itself.
const EM_DASH = String.fromCharCode(0x2014);

const BINARY_EXTENSIONS = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.ico',
    '.pdf',
    '.ttf',
    '.otf',
    '.woff',
    '.woff2',
]);

const SKIPPED_FILES = new Set(['pnpm-lock.yaml']);

/**
 * Prompt files generated and overwritten by the OpenSpec CLI, not written for
 * this project. They ship with em dashes upstream, and a fix here would be
 * undone on the next `openspec update`.
 */
const GENERATED_PREFIXES = [
    '.claude/commands/opsx/',
    '.claude/skills/openspec-',
];

/** The rule itself has to show the banned character once, in backticks. */
const CLAUDE_MD_RULE_QUOTE = `(\`${EM_DASH}\`)`;

function trackedTextFiles(): string[] {
    const output = execFileSync('git', ['ls-files'], {
        cwd: process.cwd(),
        encoding: 'utf8',
    });
    return output
        .split('\n')
        .filter(Boolean)
        .filter(
            (file) => !BINARY_EXTENSIONS.has(path.extname(file).toLowerCase())
        )
        .filter((file) => !SKIPPED_FILES.has(path.basename(file)))
        .filter(
            (file) =>
                !GENERATED_PREFIXES.some((prefix) => file.startsWith(prefix))
        )
        .filter((file) => fs.existsSync(path.join(process.cwd(), file)));
}

function emDashLines(file: string): string[] {
    const text = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    return text
        .split('\n')
        .map((line, index) => ({ line, lineNumber: index + 1 }))
        .filter(({ line }) => line.includes(EM_DASH))
        .map(({ line, lineNumber }) => `${file}:${lineNumber}: ${line.trim()}`);
}

describe('em dash ban', () => {
    const files = trackedTextFiles();

    it('checks the tracked files', () => {
        expect(files.length).toBeGreaterThan(0);
        expect(files).toContain('CLAUDE.md');
    });

    it('finds no em dash in any tracked text file except CLAUDE.md', () => {
        const offending = files
            .filter((file) => file !== 'CLAUDE.md')
            .flatMap(emDashLines);

        expect(offending).toEqual([]);
    });

    it('allows only the single quoted em dash in the CLAUDE.md rule', () => {
        const text = fs.readFileSync(
            path.join(process.cwd(), 'CLAUDE.md'),
            'utf8'
        );
        const occurrences = text.split(EM_DASH).length - 1;

        expect(occurrences).toBe(1);
        expect(text).toContain(CLAUDE_MD_RULE_QUOTE);
    });
});

describe('docs/wiki', () => {
    const wikiPages = markdownFilesIn(WIKI_DIRECTORY);
    const wikiPageSet = new Set(wikiPages);

    it('has pages', () => {
        expect(wikiPages.length).toBeGreaterThan(0);
    });

    it.each(wikiPages)('%s stays under 150 lines', (page) => {
        const lineCount = readText(WIKI_DIRECTORY, page)
            .replace(/\n$/, '')
            .split('\n').length;

        expect(lineCount).toBeLessThan(150);
    });

    it.each(wikiPages)('%s links only to wiki pages that exist', (page) => {
        const text = readText(WIKI_DIRECTORY, page);
        const linkTargets = [...text.matchAll(/\]\(([^)\s]+)\)/g)]
            .map((match) => match[1])
            .filter((target) => !/^[a-z]+:/i.test(target))
            .map((target) => target.split('#')[0])
            .filter((target) => target.endsWith('.md'));

        const missing = linkTargets.filter(
            (target) => !wikiPageSet.has(target)
        );

        expect(missing).toEqual([]);
    });
});
