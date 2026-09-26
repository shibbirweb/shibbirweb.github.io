import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { parseFlowDiagram } from '@/components/pages/articles/FlowDiagram/parseFlowDiagram';
import { DIFFICULTIES } from '@/lib/articleSchema';
import {
    ARTICLES_DIRECTORY,
    markdownFilesIn,
    readText,
    scanMarkdown,
} from '@tests/content/markdownFences';

// Guards the real articles, so an edit that would break a page (a bad date, a
// stray H1, a typo in a flow diagram) fails here instead of in the browser.

const FILE_NAME_PATTERN = /^\d{2}-[a-z0-9-]+\.mdx?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Built from its code point so this file never contains the character itself.
const EM_DASH = String.fromCharCode(0x2014);

const articleFiles = markdownFilesIn(ARTICLES_DIRECTORY);

const articles = articleFiles.map((fileName) => {
    const { data, content } = matter(readText(ARTICLES_DIRECTORY, fileName));
    return {
        fileName,
        prefix: fileName.slice(0, 2),
        slug: fileName.replace(/\.mdx?$/, '').replace(/^\d+-/, ''),
        frontmatter: data as Record<string, unknown>,
        body: content,
    };
});

function isRealDate(value: string): boolean {
    if (!DATE_PATTERN.test(value)) {
        return false;
    }
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === value
    );
}

function expectStringList(value: unknown) {
    expect(Array.isArray(value)).toBe(true);
    for (const entry of value as unknown[]) {
        expect(typeof entry).toBe('string');
        expect((entry as string).trim()).not.toBe('');
    }
}

describe('content/articles', () => {
    it('has at least one article', () => {
        expect(articleFiles.length).toBeGreaterThan(0);
    });

    it('uses unique ordering prefixes', () => {
        const prefixes = articles.map((article) => article.prefix);
        expect(new Set(prefixes).size).toBe(prefixes.length);
    });

    it('uses unique slugs', () => {
        const slugs = articles.map((article) => article.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    for (const { frontmatter, body, fileName } of articles) {
        describe(fileName, () => {
            it('is named NN-<slug>.md', () => {
                expect(fileName).toMatch(FILE_NAME_PATTERN);
            });

            it('has a title and description', () => {
                expect(typeof frontmatter.title).toBe('string');
                expect((frontmatter.title as string).trim()).not.toBe('');
                expect(typeof frontmatter.description).toBe('string');
                expect((frontmatter.description as string).trim()).not.toBe('');
            });

            it('has a real YYYY-MM-DD date', () => {
                expect(typeof frontmatter.date).toBe('string');
                expect(isRealDate(frontmatter.date as string)).toBe(true);
            });

            it('has an updated date no earlier than its date, if set', () => {
                if (frontmatter.updated === undefined) {
                    return;
                }
                expect(typeof frontmatter.updated).toBe('string');
                expect(isRealDate(frontmatter.updated as string)).toBe(true);
                expect(
                    (frontmatter.updated as string) >=
                        (frontmatter.date as string)
                ).toBe(true);
            });

            it('has at least one tag', () => {
                expectStringList(frontmatter.tags);
                expect((frontmatter.tags as string[]).length).toBeGreaterThan(
                    0
                );
            });

            it('lists its tech and learn items', () => {
                expectStringList(frontmatter.tech);
                expectStringList(frontmatter.learn);
            });

            it('uses a known difficulty, if set', () => {
                if (frontmatter.difficulty === undefined) {
                    return;
                }
                expect(DIFFICULTIES).toContain(frontmatter.difficulty);
            });

            it('points its cover at a file under public/, if set', () => {
                if (frontmatter.cover === undefined) {
                    return;
                }
                const coverPath = path.join(
                    process.cwd(),
                    'public',
                    frontmatter.cover as string
                );
                expect(fs.existsSync(coverPath)).toBe(true);
            });

            it('has no H1 and no H4 or deeper heading in its body', () => {
                const { proseLines } = scanMarkdown(body);
                const badHeadings = proseLines.filter(({ text }) =>
                    /^(#|#{4,6})\s/.test(text)
                );

                expect(badHeadings).toEqual([]);
            });

            it('never uses the em dash character', () => {
                const raw = readText(ARTICLES_DIRECTORY, fileName);
                const offendingLines = raw
                    .split('\n')
                    .map((text, index) => ({ text, lineNumber: index + 1 }))
                    .filter(({ text }) => text.includes(EM_DASH));

                expect(offendingLines).toEqual([]);
            });

            it('has reactflow fences that all parse', () => {
                const reactflowFences = scanMarkdown(body).fences.filter(
                    (fence) => fence.language === 'reactflow'
                );
                for (const fence of reactflowFences) {
                    expect(
                        () => parseFlowDiagram(fence.body),
                        `reactflow fence at body line ${fence.lineNumber}`
                    ).not.toThrow();
                }
            });
        });
    }
});
