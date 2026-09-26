import { describe, expect, it } from 'vitest';
import type { ArticleSummary } from '@/lib/posts';
import { searchArticles, searchTerms } from '@/utils/searchArticles';

function article(
    slug: string,
    overrides: Partial<ArticleSummary> = {}
): ArticleSummary {
    return {
        slug,
        title: 'Untitled',
        description: '',
        date: '2026-01-01',
        tags: [],
        cover: `/images/${slug}.svg`,
        coverColors: ['#000000', '#ffffff'],
        readingMinutes: 5,
        ...overrides,
    };
}

function scoreFor(
    candidate: ArticleSummary,
    query: string
): number | undefined {
    return searchArticles([candidate], query)[0]?.score;
}

describe('searchTerms', () => {
    it('lowercases and splits on any whitespace', () => {
        expect(searchTerms('  Git   Cherry\tPick ')).toEqual([
            'git',
            'cherry',
            'pick',
        ]);
    });

    it('returns no terms for a blank query', () => {
        expect(searchTerms('   ')).toEqual([]);
    });
});

describe('searchArticles', () => {
    it('returns nothing for an empty or blank query', () => {
        const articles = [article('a', { title: 'Git' })];
        expect(searchArticles(articles, '')).toEqual([]);
        expect(searchArticles(articles, '   ')).toEqual([]);
    });

    it('matches case-insensitively', () => {
        const articles = [article('a', { title: 'Laravel Collations' })];
        expect(searchArticles(articles, 'LARAVEL')).toHaveLength(1);
    });

    it('requires every term to match somewhere (AND semantics)', () => {
        const articles = [
            article('both', { title: 'Git', tags: ['Hotfix'] }),
            article('one', { title: 'Git basics' }),
        ];
        const slugs = searchArticles(articles, 'git hotfix').map(
            (result) => result.article.slug
        );
        expect(slugs).toEqual(['both']);
    });

    it('matches a term found only in the description', () => {
        const articles = [
            article('a', { title: 'Other', description: 'about DNS servers' }),
        ];
        expect(searchArticles(articles, 'dns')).toHaveLength(1);
    });

    it('excludes articles with no match at all', () => {
        expect(
            searchArticles([article('a', { title: 'Git' })], 'docker')
        ).toEqual([]);
    });

    it('scores an exact title match highest (100)', () => {
        expect(scoreFor(article('a', { title: 'Git' }), 'git')).toBe(100);
    });

    it('scores a title prefix match at 40', () => {
        expect(scoreFor(article('a', { title: 'Git tricks' }), 'git')).toBe(40);
    });

    it('scores a title substring match at 20', () => {
        expect(scoreFor(article('a', { title: 'Using git well' }), 'git')).toBe(
            20
        );
    });

    it('scores an exact tag match at 30', () => {
        expect(
            scoreFor(article('a', { title: 'X', tags: ['Git'] }), 'git')
        ).toBe(30);
    });

    it('scores a partial tag match at 12', () => {
        expect(
            scoreFor(article('a', { title: 'X', tags: ['GitHub'] }), 'git')
        ).toBe(12);
    });

    it('scores a description match at 4', () => {
        expect(
            scoreFor(article('a', { title: 'X', description: 'git' }), 'git')
        ).toBe(4);
    });

    it('adds up the tiers across fields and terms', () => {
        const candidate = article('a', {
            title: 'Git tricks',
            tags: ['Git'],
            description: 'git and tricks',
        });
        // git: prefix 40 + exact tag 30 + description 4
        // tricks: substring 20 + description 4
        expect(scoreFor(candidate, 'git tricks')).toBe(98);
    });

    it('ranks higher scores first', () => {
        const results = searchArticles(
            [
                article('description', { title: 'X', description: 'git' }),
                article('exact', { title: 'Git' }),
                article('tag', { title: 'Y', tags: ['Git'] }),
            ],
            'git'
        );
        expect(results.map((result) => result.article.slug)).toEqual([
            'exact',
            'tag',
            'description',
        ]);
    });

    it('breaks a score tie in favour of the newest article', () => {
        const results = searchArticles(
            [
                article('older', { title: 'Git one', date: '2026-01-01' }),
                article('newest', { title: 'Git two', date: '2026-09-01' }),
                article('middle', { title: 'Git three', date: '2026-05-01' }),
            ],
            'git'
        );
        expect(results.map((result) => result.article.slug)).toEqual([
            'newest',
            'middle',
            'older',
        ]);
    });
});
