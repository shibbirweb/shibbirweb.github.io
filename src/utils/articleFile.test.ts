import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ArticleFrontmatter } from '@/lib/articleSchema';
import {
    nextNumberPrefix,
    parseArticleFile,
    serializeArticle,
} from '@/utils/articleFile';

function frontmatterWith(
    overrides: Partial<ArticleFrontmatter> = {}
): ArticleFrontmatter {
    return {
        title: 'A title',
        description: 'A description',
        date: '2026-08-01',
        tags: [],
        tech: [],
        learn: [],
        ...overrides,
    };
}

function frontmatterBlock(file: string): string[] {
    const [, block] = file.split('---\n');
    return block.trimEnd().split('\n');
}

describe('nextNumberPrefix', () => {
    it('starts an empty folder at 01', () => {
        expect(nextNumberPrefix([])).toBe('01');
    });

    it('is one more than the largest leading number', () => {
        expect(
            nextNumberPrefix(['01-first.md', '03-third.md', '02-second.md'])
        ).toBe('04');
    });

    it('ignores names without a leading number', () => {
        expect(nextNumberPrefix(['README.md', '.DS_Store', '01-a.md'])).toBe(
            '02'
        );
    });

    it('pads to two digits but grows past 99', () => {
        expect(nextNumberPrefix(['08-a.md'])).toBe('09');
        expect(nextNumberPrefix(['99-a.md'])).toBe('100');
    });
});

describe('serializeArticle', () => {
    it('writes the fields in house order', () => {
        const file = serializeArticle(
            frontmatterWith({
                updated: '2026-08-02',
                tags: ['Git'],
                cover: '/images/articles/cover.svg',
                category: 'Version Control',
                difficulty: 'Advanced',
                tech: ['Git'],
                series: { name: 'Git rescues', order: 2 },
                learn: ['One thing'],
                draft: true,
            }),
            'Body'
        );
        const keys = frontmatterBlock(file)
            .filter((line) => !line.startsWith(' '))
            .map((line) => line.split(':')[0]);
        expect(keys).toEqual([
            'title',
            'description',
            'date',
            'updated',
            'tags',
            'cover',
            'category',
            'difficulty',
            'tech',
            'series',
            'learn',
            'draft',
        ]);
    });

    it('single-quotes scalars and doubles inner single quotes', () => {
        const file = serializeArticle(
            frontmatterWith({
                title: "Laravel's trap",
                description: 'It is "fine"',
            }),
            'Body'
        );
        expect(file).toContain("title: 'Laravel''s trap'");
        expect(file).toContain(`description: 'It is "fine"'`);
        expect(file).toContain("date: '2026-08-01'");
    });

    it('writes tags and tech as inline single-quoted arrays', () => {
        const file = serializeArticle(
            frontmatterWith({
                tags: ['Git', "Dev's tools"],
                tech: ['Node.js'],
            }),
            'Body'
        );
        expect(file).toContain("tags: ['Git', 'Dev''s tools']");
        expect(file).toContain("tech: ['Node.js']");
    });

    it('writes series as a 4-space-indented block with a bare order number', () => {
        const file = serializeArticle(
            frontmatterWith({ series: { name: 'Homelab', order: 3 } }),
            'Body'
        );
        expect(file).toContain("series:\n    name: 'Homelab'\n    order: 3\n");
    });

    it('writes learn as a 4-space-indented list of quoted items', () => {
        const file = serializeArticle(
            frontmatterWith({ learn: ['First', "Second's"] }),
            'Body'
        );
        expect(file).toContain("learn:\n    - 'First'\n    - 'Second''s'\n");
    });

    it('omits empty optional fields entirely', () => {
        const file = serializeArticle(frontmatterWith(), 'Body');
        expect(frontmatterBlock(file)).toEqual([
            "title: 'A title'",
            "description: 'A description'",
            "date: '2026-08-01'",
        ]);
    });

    it('drops a series that has no name', () => {
        const file = serializeArticle(
            frontmatterWith({ series: { name: '', order: 1 } }),
            'Body'
        );
        expect(file).not.toContain('series:');
    });

    it('writes draft only when it is true', () => {
        expect(
            serializeArticle(frontmatterWith({ draft: true }), 'Body')
        ).toContain('\ndraft: true\n');
        expect(
            serializeArticle(frontmatterWith({ draft: false }), 'Body')
        ).not.toContain('draft');
        expect(serializeArticle(frontmatterWith(), 'Body')).not.toContain(
            'draft'
        );
    });

    it('separates the body by one blank line and ends with exactly one newline', () => {
        const file = serializeArticle(
            frontmatterWith(),
            '\n\n\nFirst paragraph.\n\nSecond paragraph.\n\n\n   '
        );
        expect(
            file.endsWith('---\n\nFirst paragraph.\n\nSecond paragraph.\n')
        ).toBe(true);
    });

    it('keeps the leading indentation of the first body line', () => {
        const file = serializeArticle(frontmatterWith(), '\n    indented code');
        expect(file).toContain('---\n\n    indented code\n');
    });
});

describe('parseArticleFile', () => {
    it('reads every frontmatter field and the body', () => {
        const raw = [
            '---',
            "title: 'Laravel''s trap'",
            "description: 'Desc'",
            "date: '2026-07-10'",
            "updated: '2026-07-11'",
            "tags: ['Laravel', 'MySQL']",
            "cover: '/images/cover.svg'",
            "category: 'Backend'",
            "difficulty: 'Intermediate'",
            "tech: ['SQL']",
            'series:',
            "    name: 'Deep dive'",
            '    order: 2',
            'learn:',
            "    - 'One'",
            'draft: true',
            '---',
            '',
            'Hello body.',
            '',
        ].join('\n');
        expect(parseArticleFile(raw)).toEqual({
            frontmatter: {
                title: "Laravel's trap",
                description: 'Desc',
                date: '2026-07-10',
                updated: '2026-07-11',
                tags: ['Laravel', 'MySQL'],
                cover: '/images/cover.svg',
                category: 'Backend',
                difficulty: 'Intermediate',
                tech: ['SQL'],
                learn: ['One'],
                series: { name: 'Deep dive', order: 2 },
                draft: true,
            },
            body: 'Hello body.',
        });
    });

    it('falls back to safe empty defaults when fields are missing', () => {
        const { frontmatter, body } = parseArticleFile('---\n---\n');
        expect(frontmatter).toMatchObject({
            title: '',
            description: '',
            date: '',
            tags: [],
            tech: [],
            learn: [],
        });
        expect(frontmatter.updated).toBeUndefined();
        expect(frontmatter.series).toBeUndefined();
        expect(frontmatter.draft).toBeUndefined();
        expect(body).toBe('');
    });

    it('coerces unquoted YAML dates back to YYYY-MM-DD strings', () => {
        const { frontmatter } = parseArticleFile(
            '---\ndate: 2026-08-01\nupdated: 2026-08-05\n---\nBody\n'
        );
        expect(frontmatter.date).toBe('2026-08-01');
        expect(frontmatter.updated).toBe('2026-08-05');
    });

    it('keeps only string entries in list fields', () => {
        const { frontmatter } = parseArticleFile(
            "---\ntags: ['Git', 5, null]\ntech: 'not a list'\n---\nBody\n"
        );
        expect(frontmatter.tags).toEqual(['Git']);
        expect(frontmatter.tech).toEqual([]);
    });

    it('drops a series without a name and zeroes a non-numeric order', () => {
        expect(
            parseArticleFile('---\nseries:\n    order: 2\n---\nBody\n')
                .frontmatter.series
        ).toBeUndefined();
        expect(
            parseArticleFile(
                "---\nseries:\n    name: 'Homelab'\n    order: 'first'\n---\nBody\n"
            ).frontmatter.series
        ).toEqual({ name: 'Homelab', order: 0 });
    });

    it('treats only a literal true as a draft', () => {
        expect(
            parseArticleFile("---\ndraft: 'yes'\n---\nBody\n").frontmatter.draft
        ).toBeUndefined();
        expect(
            parseArticleFile('---\ndraft: false\n---\nBody\n').frontmatter.draft
        ).toBeUndefined();
    });

    it('trims blank lines around the body', () => {
        expect(
            parseArticleFile('---\ntitle: x\n---\n\n\nBody text\n\n\n').body
        ).toBe('Body text');
    });
});

describe('house-style round trip', () => {
    const articlesDirectory = join(process.cwd(), 'content', 'articles');
    const articleFiles = readdirSync(articlesDirectory).filter((name) =>
        name.endsWith('.md')
    );

    it('finds real articles to check', () => {
        expect(articleFiles.length).toBeGreaterThan(0);
    });

    it.each(articleFiles)('re-serializes %s byte for byte', (fileName) => {
        const raw = readFileSync(join(articlesDirectory, fileName), 'utf8');
        const { frontmatter, body } = parseArticleFile(raw);
        expect(serializeArticle(frontmatter, body)).toBe(raw);
    });

    it('round-trips a fully populated synthetic article', () => {
        const frontmatter = frontmatterWith({
            title: "It's a 'quoted' title: with a colon",
            updated: '2026-08-03',
            tags: ['A', "B's"],
            cover: '/images/articles/x.svg',
            category: 'Cat',
            difficulty: 'Beginner',
            tech: ['T'],
            series: { name: 'Series', order: 4 },
            learn: ['L1', 'L2'],
            draft: true,
        });
        const file = serializeArticle(frontmatter, '## Heading\n\nText.');
        expect(parseArticleFile(file)).toEqual({
            frontmatter,
            body: '## Heading\n\nText.',
        });
    });
});
