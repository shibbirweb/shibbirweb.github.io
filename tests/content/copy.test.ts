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

/**
 * The agent rules block `next dev` writes into AGENTS.md. Next rewrites it to
 * its own wording on every run (see generate-agent-files.js in next), em
 * dashes included, so only the lines between these markers are exempt; the
 * rest of the file still follows the ban.
 */
const NEXT_AGENT_RULES_START = '<!-- BEGIN:nextjs-agent-rules -->';
const NEXT_AGENT_RULES_END = '<!-- END:nextjs-agent-rules -->';

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

/** Each line of `text` holding an em dash, outside Next's generated block. */
function emDashLinesIn(file: string, text: string): string[] {
    let insideGeneratedBlock = false;
    return text
        .split('\n')
        .map((line, index) => {
            if (line.includes(NEXT_AGENT_RULES_START)) {
                insideGeneratedBlock = true;
            }
            const skipped = insideGeneratedBlock;
            if (line.includes(NEXT_AGENT_RULES_END)) {
                insideGeneratedBlock = false;
            }
            return { line, lineNumber: index + 1, skipped };
        })
        .filter(({ line, skipped }) => !skipped && line.includes(EM_DASH))
        .map(({ line, lineNumber }) => `${file}:${lineNumber}: ${line.trim()}`);
}

function emDashLines(file: string): string[] {
    return emDashLinesIn(
        file,
        fs.readFileSync(path.join(process.cwd(), file), 'utf8')
    );
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

    it("skips only Next's generated agent rules block", () => {
        const text = [
            `before ${EM_DASH} caught`,
            NEXT_AGENT_RULES_START,
            `generated ${EM_DASH} skipped`,
            NEXT_AGENT_RULES_END,
            `after ${EM_DASH} caught`,
        ].join('\n');

        expect(emDashLinesIn('AGENTS.md', text)).toEqual([
            `AGENTS.md:1: before ${EM_DASH} caught`,
            `AGENTS.md:5: after ${EM_DASH} caught`,
        ]);
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
