import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import * as markdownModule from '@/lib/markdown';
import * as realPosts from '@/lib/posts';
import {
    coverGradientForSlug,
    generatedCoverPath,
} from '@/utils/generateArticleCover';

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

const REAL_SLUGS = [
    'the-hidden-firstorcreate-case-sensitivity-trap-in-laravel',
    'how-git-cherry-pick-rescued-a-hotfix-branched-from-the-wrong-place',
    'using-pi-hole-without-pinning-my-whole-network-to-one-dns-server',
];

describe('posts against the real content/articles corpus', () => {
    it('drops the NN- ordering prefix from every slug', () => {
        const slugs = realPosts.getAllArticles().map((article) => article.slug);

        expect([...slugs].sort()).toEqual([...REAL_SLUGS].sort());
        for (const slug of slugs) {
            expect(slug).not.toMatch(/^\d+-/);
        }
    });

    it('lists articles newest first', () => {
        const dates = realPosts.getAllArticles().map((article) => article.date);

        expect(dates).toEqual([...dates].sort().reverse());
    });

    it('gives every article a reading time of at least one minute', () => {
        for (const article of realPosts.getAllArticles()) {
            expect(article.readingMinutes).toBeGreaterThanOrEqual(1);
        }
    });

    it('falls back to the generated cover path with two hex cover colours', () => {
        for (const article of realPosts.getAllArticles()) {
            expect(article.cover).toBe(generatedCoverPath(article.slug));
            expect(article.coverColors).toHaveLength(2);
            expect(article.coverColors[0]).toMatch(HEX_COLOR);
            expect(article.coverColors[1]).toMatch(HEX_COLOR);
        }
    });

    it('reports that articles exist', () => {
        expect(realPosts.hasArticles()).toBe(true);
    });

    it('returns the newest articles for getLatestArticles', () => {
        const all = realPosts.getAllArticles();

        expect(realPosts.getLatestArticles(2)).toEqual(all.slice(0, 2));
        expect(realPosts.getLatestArticles(0)).toEqual([]);
    });

    it('paginates by ARTICLES_PER_PAGE with at least one page', () => {
        const all = realPosts.getAllArticles();

        expect(realPosts.ARTICLES_PER_PAGE).toBe(9);
        expect(realPosts.getArticlePageCount()).toBe(
            Math.max(1, Math.ceil(all.length / realPosts.ARTICLES_PER_PAGE))
        );
        expect(realPosts.getArticlesForPage(1)).toEqual(
            all.slice(0, realPosts.ARTICLES_PER_PAGE)
        );
        expect(realPosts.getArticlesForPage(99)).toEqual([]);
    });

    it('collects every tag once, sorted alphabetically', () => {
        const tags = realPosts.getAllTags();

        expect(new Set(tags).size).toBe(tags.length);
        expect(tags).toEqual([...tags].sort((a, b) => a.localeCompare(b)));
        expect(tags).toEqual(expect.arrayContaining(['Git', 'Laravel', 'DNS']));
    });

    it('returns no related articles when nothing shares a tag, category, or series', () => {
        expect(
            realPosts.getRelatedArticles(
                'how-git-cherry-pick-rescued-a-hotfix-branched-from-the-wrong-place'
            )
        ).toEqual([]);
    });

    it('links neighbours in feed order: next is newer, previous is older', () => {
        const all = realPosts.getAllArticles();

        expect(realPosts.getAdjacentArticles(all[0].slug)).toEqual({
            next: undefined,
            previous: all[1],
        });
        expect(realPosts.getAdjacentArticles(all[1].slug)).toEqual({
            next: all[0],
            previous: all[2],
        });
        expect(realPosts.getAdjacentArticles(all[all.length - 1].slug)).toEqual(
            { next: all[all.length - 2], previous: undefined }
        );
        expect(realPosts.getAdjacentArticles('no-such-article')).toEqual({});
    });

    it('returns no series for standalone articles', () => {
        for (const slug of REAL_SLUGS) {
            expect(realPosts.getSeriesForArticle(slug)).toBeNull();
        }
    });

    it('renders a full article with HTML, a TOC, and frontmatter lists', async () => {
        const article = await realPosts.getArticle(
            'using-pi-hole-without-pinning-my-whole-network-to-one-dns-server'
        );

        expect(article).not.toBeNull();
        expect(article?.title).toBe(
            'Using Pi-hole Without Pinning My Whole Network to One DNS Server'
        );
        expect(article?.html).toContain('<h2 id="');
        expect(article?.toc.length).toBeGreaterThan(0);
        expect(article?.tech).toContain('WireGuard');
        expect(article?.learn.length).toBeGreaterThan(0);
    });

    it('returns null for a slug that does not exist', async () => {
        expect(await realPosts.getArticle('no-such-article')).toBeNull();
    });

    it('does not resolve an article by its prefixed filename', async () => {
        expect(
            await realPosts.getArticle(
                '02-how-git-cherry-pick-rescued-a-hotfix-branched-from-the-wrong-place'
            )
        ).toBeNull();
    });
});

interface FixtureArticle {
    fileName: string;
    frontmatter: string[];
    body?: string;
}

describe('posts against synthetic fixtures', () => {
    let fixtureRoot: string;
    let articlesDirectory: string;
    let publicDirectory: string;
    let posts: typeof realPosts;

    /** Replace the fixture corpus with exactly these files. */
    function writeArticles(articles: FixtureArticle[]): void {
        fs.rmSync(articlesDirectory, { recursive: true, force: true });
        fs.mkdirSync(articlesDirectory, { recursive: true });
        for (const article of articles) {
            const source = [
                '---',
                ...article.frontmatter,
                '---',
                '',
                article.body ?? 'Body text.',
                '',
            ].join('\n');
            fs.writeFileSync(
                path.join(articlesDirectory, article.fileName),
                source
            );
        }
    }

    /** A published article with a title, a date, and any extra frontmatter lines. */
    function published(
        fileName: string,
        date: string,
        extraLines: string[] = []
    ): FixtureArticle {
        return {
            fileName,
            frontmatter: [
                `title: '${fileName}'`,
                `date: '${date}'`,
                ...extraLines,
            ],
        };
    }

    function slugs(): string[] {
        return posts.getAllArticles().map((article) => article.slug);
    }

    beforeAll(async () => {
        fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-test-'));
        articlesDirectory = path.join(fixtureRoot, 'content/articles');
        publicDirectory = path.join(fixtureRoot, 'public');
        fs.mkdirSync(articlesDirectory, { recursive: true });
        fs.mkdirSync(path.join(publicDirectory, 'images'), { recursive: true });

        // posts.ts resolves its directories from process.cwd() at import time,
        // so load a fresh copy while cwd points at the fixture root. The already
        // loaded markdown module is reused so marked is not configured twice.
        vi.spyOn(process, 'cwd').mockReturnValue(fixtureRoot);
        vi.resetModules();
        vi.doMock('@/lib/markdown', () => markdownModule);
        posts = await import('@/lib/posts');
    });

    afterAll(() => {
        vi.doUnmock('@/lib/markdown');
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
    });

    beforeEach(() => {
        writeArticles([]);
    });

    describe('reading files', () => {
        it('returns no articles when the articles directory is missing', () => {
            fs.rmSync(articlesDirectory, { recursive: true, force: true });

            expect(posts.getAllArticles()).toEqual([]);
            expect(posts.hasArticles()).toBe(false);
            expect(posts.getArticlePageCount()).toBe(1);
        });

        it('reads .md and .mdx files and ignores everything else', () => {
            writeArticles([
                published('01-markdown.md', '2026-01-01'),
                published('02-mdx-post.mdx', '2026-01-02'),
                published('03-notes.txt', '2026-01-03'),
            ]);

            expect(slugs().sort()).toEqual(['markdown', 'mdx-post']);
        });

        it('only strips a leading numeric prefix from the slug', () => {
            writeArticles([published('07-top-10-tips.md', '2026-01-01')]);

            expect(slugs()).toEqual(['top-10-tips']);
        });

        it('re-reads the directory on each call outside production', () => {
            writeArticles([published('01-first.md', '2026-01-01')]);
            expect(slugs()).toEqual(['first']);

            writeArticles([published('02-second.md', '2026-01-01')]);
            expect(slugs()).toEqual(['second']);
        });
    });

    describe('summaries', () => {
        it('falls back to the slug as title and to empty description and tags', () => {
            writeArticles([
                {
                    fileName: '01-bare.md',
                    frontmatter: ["date: '2026-01-01'", "tags: 'not-a-list'"],
                },
            ]);

            const [article] = posts.getAllArticles();

            expect(article.title).toBe('bare');
            expect(article.description).toBe('');
            expect(article.tags).toEqual([]);
            expect(article.updated).toBeUndefined();
            expect(article.series).toBeUndefined();
        });

        it('normalises an unquoted YAML date to YYYY-MM-DD', () => {
            writeArticles([
                {
                    fileName: '01-unquoted.md',
                    frontmatter: ['date: 2026-08-01', 'updated: 2026-08-05'],
                },
            ]);

            const [article] = posts.getAllArticles();

            expect(article.date).toBe('2026-08-01');
            expect(article.updated).toBe('2026-08-05');
        });

        it('estimates reading time at 200 words per minute, never below one', () => {
            writeArticles([
                {
                    ...published('01-long.md', '2026-01-01'),
                    body: Array(1000).fill('word').join(' '),
                },
                {
                    ...published('02-empty.md', '2026-01-02'),
                    body: '',
                },
            ]);

            const bySlug = Object.fromEntries(
                posts
                    .getAllArticles()
                    .map((article) => [article.slug, article.readingMinutes])
            );

            expect(bySlug).toEqual({ long: 5, empty: 1 });
        });

        it('uses the generated cover and its gradient pair when no cover is set', () => {
            writeArticles([published('01-generated.md', '2026-01-01')]);

            const [article] = posts.getAllArticles();

            expect(article.cover).toBe(generatedCoverPath('generated'));
            expect(article.coverColors).toEqual(
                coverGradientForSlug('generated')
            );
        });

        it('reads the first two gradient stops from an author-provided SVG cover', () => {
            fs.writeFileSync(
                path.join(publicDirectory, 'images/two-stops.svg'),
                '<svg><stop stop-color="#112233"/><stop stop-color="#abcdef"/><stop stop-color="#000000"/></svg>'
            );
            writeArticles([
                published('01-custom.md', '2026-01-01', [
                    "cover: '/images/two-stops.svg'",
                ]),
            ]);

            const [article] = posts.getAllArticles();

            expect(article.cover).toBe('/images/two-stops.svg');
            expect(article.coverColors).toEqual(['#112233', '#abcdef']);
        });

        it('repeats a single gradient stop for both cover colours', () => {
            fs.writeFileSync(
                path.join(publicDirectory, 'images/one-stop.svg'),
                '<svg><stop stop-color="#445566"/></svg>'
            );
            writeArticles([
                published('01-single.md', '2026-01-01', [
                    "cover: '/images/one-stop.svg'",
                ]),
            ]);

            expect(posts.getAllArticles()[0].coverColors).toEqual([
                '#445566',
                '#445566',
            ]);
        });

        it('falls back to the slug gradient when a custom cover is missing', () => {
            writeArticles([
                published('01-missing-cover.md', '2026-01-01', [
                    "cover: '/images/does-not-exist.svg'",
                ]),
            ]);

            expect(posts.getAllArticles()[0].coverColors).toEqual(
                coverGradientForSlug('missing-cover')
            );
        });

        it('coerces a series order to a number, defaulting to 0', () => {
            writeArticles([
                published('01-numbered.md', '2026-01-01', [
                    'series:',
                    "    name: 'Saga'",
                    "    order: '2'",
                ]),
                published('02-unordered.md', '2026-01-02', [
                    'series:',
                    "    name: 'Saga'",
                    "    order: 'first'",
                ]),
            ]);

            const bySlug = Object.fromEntries(
                posts
                    .getAllArticles()
                    .map((article) => [article.slug, article.series])
            );

            expect(bySlug).toEqual({
                numbered: { name: 'Saga', order: 2 },
                unordered: { name: 'Saga', order: 0 },
            });
        });
    });

    describe('drafts and dates', () => {
        it('hides drafts from the listing and from getArticle', async () => {
            writeArticles([
                published('01-live.md', '2026-01-01'),
                published('02-wip.md', '2026-01-02', ['draft: true']),
            ]);

            expect(slugs()).toEqual(['live']);
            expect(await posts.getArticle('wip')).toBeNull();
        });

        it('allows a draft to have no date', () => {
            writeArticles([
                published('01-live.md', '2026-01-01'),
                { fileName: '02-undated.md', frontmatter: ['draft: true'] },
            ]);

            expect(slugs()).toEqual(['live']);
        });

        it('throws, naming the article, when a published date is missing', () => {
            writeArticles([
                {
                    fileName: '01-undated.md',
                    frontmatter: ["title: 'Undated'"],
                },
            ]);

            expect(() => posts.getAllArticles()).toThrow(/"undated".*date/);
        });

        it('throws when a published date is malformed', () => {
            writeArticles([published('01-bad-date.md', 'not-a-date')]);

            expect(() => posts.getAllArticles()).toThrow(/"bad-date"/);
        });

        it('throws when the updated date is malformed', () => {
            writeArticles([
                published('01-bad-updated.md', '2026-01-01', [
                    "updated: 'someday'",
                ]),
            ]);

            expect(() => posts.getAllArticles()).toThrow(
                /"bad-updated" has an invalid `updated:` date/
            );
        });

        it('sorts by date regardless of the filename prefix', () => {
            writeArticles([
                published('01-newest.md', '2026-03-01'),
                published('02-oldest.md', '2026-01-01'),
                published('03-middle.md', '2026-02-01'),
            ]);

            expect(slugs()).toEqual(['newest', 'middle', 'oldest']);
        });

        it('keeps same-date articles together between newer and older ones', () => {
            writeArticles([
                published('01-older.md', '2026-01-01'),
                published('02-same-a.md', '2026-02-01'),
                published('03-same-b.md', '2026-02-01'),
                published('04-newer.md', '2026-03-01'),
            ]);

            const order = slugs();

            expect(order[0]).toBe('newer');
            expect(order.slice(1, 3).sort()).toEqual(['same-a', 'same-b']);
            expect(order[3]).toBe('older');
        });
    });

    describe('getRelatedArticles', () => {
        it('ranks by shared tags (3 each), category (4), and series (5)', () => {
            writeArticles([
                published('01-current.md', '2026-01-01', [
                    "tags: ['a', 'b', 'c']",
                    "category: 'Backend'",
                    'series:',
                    "    name: 'Saga'",
                    '    order: 1',
                ]),
                // 1 tag = 3
                published('02-one-tag.md', '2026-01-02', ["tags: ['a']"]),
                // category = 4
                published('03-category.md', '2026-01-03', [
                    "category: 'Backend'",
                ]),
                // series = 5
                published('04-series.md', '2026-01-04', [
                    'series:',
                    "    name: 'Saga'",
                    '    order: 2',
                ]),
                // 2 tags = 6
                published('05-two-tags.md', '2026-01-05', ["tags: ['a', 'b']"]),
                // no signal
                published('06-unrelated.md', '2026-01-06', ["tags: ['z']"]),
            ]);

            expect(
                posts
                    .getRelatedArticles('current', 10)
                    .map((article) => article.slug)
            ).toEqual(['two-tags', 'series', 'category', 'one-tag']);
        });

        it('breaks score ties by recency', () => {
            writeArticles([
                published('01-current.md', '2026-01-01', ["tags: ['a']"]),
                published('02-old.md', '2026-01-02', ["tags: ['a']"]),
                published('03-new.md', '2026-01-09', ["tags: ['a']"]),
                published('04-mid.md', '2026-01-05', ["tags: ['a']"]),
            ]);

            expect(
                posts
                    .getRelatedArticles('current')
                    .map((article) => article.slug)
            ).toEqual(['new', 'mid', 'old']);
        });

        it('limits the result to three by default and honours a custom limit', () => {
            writeArticles([
                published('01-current.md', '2026-01-01', ["tags: ['a']"]),
                published('02-one.md', '2026-01-02', ["tags: ['a']"]),
                published('03-two.md', '2026-01-03', ["tags: ['a']"]),
                published('04-three.md', '2026-01-04', ["tags: ['a']"]),
                published('05-four.md', '2026-01-05', ["tags: ['a']"]),
            ]);

            expect(posts.getRelatedArticles('current')).toHaveLength(3);
            expect(posts.getRelatedArticles('current', 1)).toHaveLength(1);
        });

        it('does not match on category when the current article has none', () => {
            writeArticles([
                published('01-current.md', '2026-01-01'),
                published('02-other.md', '2026-01-02'),
            ]);

            expect(posts.getRelatedArticles('current')).toEqual([]);
        });

        it('never suggests drafts or the article itself', () => {
            writeArticles([
                published('01-current.md', '2026-01-01', ["tags: ['a']"]),
                published('02-wip.md', '2026-01-02', [
                    "tags: ['a']",
                    'draft: true',
                ]),
            ]);

            expect(posts.getRelatedArticles('current')).toEqual([]);
        });

        it('returns nothing for an unknown slug', () => {
            writeArticles([published('01-current.md', '2026-01-01')]);

            expect(posts.getRelatedArticles('missing')).toEqual([]);
        });
    });

    describe('getSeriesForArticle', () => {
        it('lists every published part in reading order and marks the current one', () => {
            writeArticles([
                published('01-part-two.md', '2026-02-01', [
                    'series:',
                    "    name: 'Saga'",
                    '    order: 2',
                ]),
                published('02-part-one.md', '2026-03-01', [
                    'series:',
                    "    name: 'Saga'",
                    '    order: 1',
                ]),
                published('03-part-three.md', '2026-01-01', [
                    'series:',
                    "    name: 'Saga'",
                    '    order: 3',
                ]),
                published('04-other-series.md', '2026-01-01', [
                    'series:',
                    "    name: 'Other'",
                    '    order: 1',
                ]),
            ]);

            expect(posts.getSeriesForArticle('part-two')).toEqual({
                name: 'Saga',
                parts: [
                    {
                        slug: 'part-one',
                        title: '02-part-one.md',
                        order: 1,
                        isCurrent: false,
                    },
                    {
                        slug: 'part-two',
                        title: '01-part-two.md',
                        order: 2,
                        isCurrent: true,
                    },
                    {
                        slug: 'part-three',
                        title: '03-part-three.md',
                        order: 3,
                        isCurrent: false,
                    },
                ],
            });
        });

        it('returns null when the series has only one published part', () => {
            writeArticles([
                published('01-alone.md', '2026-01-01', [
                    'series:',
                    "    name: 'Saga'",
                    '    order: 1',
                ]),
                published('02-draft-part.md', '2026-01-02', [
                    'series:',
                    "    name: 'Saga'",
                    '    order: 2',
                    'draft: true',
                ]),
            ]);

            expect(posts.getSeriesForArticle('alone')).toBeNull();
        });

        it('returns null for a standalone or unknown article', () => {
            writeArticles([published('01-standalone.md', '2026-01-01')]);

            expect(posts.getSeriesForArticle('standalone')).toBeNull();
            expect(posts.getSeriesForArticle('missing')).toBeNull();
        });
    });

    describe('buildArticle', () => {
        it('renders the body and keeps only string learn/tech entries', async () => {
            const article = await posts.buildArticle(
                'preview',
                {
                    title: 'Preview',
                    date: '2026-01-01',
                    learn: ['One takeaway', 42, null],
                    tech: 'not-a-list',
                },
                '## First section\n\nSome text.'
            );

            expect(article.slug).toBe('preview');
            expect(article.title).toBe('Preview');
            expect(article.html).toContain(
                '<h2 id="first-section">First section</h2>'
            );
            expect(article.toc).toEqual([
                { id: 'first-section', text: 'First section', level: 2 },
            ]);
            expect(article.learn).toEqual(['One takeaway']);
            expect(article.tech).toEqual([]);
        });

        it('builds a draft preview even without a date', async () => {
            const article = await posts.buildArticle(
                'draft-preview',
                { draft: true },
                'Hello.'
            );

            expect(article.date).toBe('');
            expect(article.html).toContain('<p>Hello.</p>');
        });
    });
});
