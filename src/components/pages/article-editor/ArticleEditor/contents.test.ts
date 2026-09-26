import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    STARTER_BODY,
    createEmptyDraft,
} from '@/components/pages/article-editor/ArticleEditor/contents';

afterEach(() => {
    vi.useRealTimers();
});

describe('createEmptyDraft', () => {
    it('dates a new draft today, as YYYY-MM-DD', () => {
        vi.useFakeTimers();
        // Midday UTC is the same calendar day in every common time zone.
        vi.setSystemTime(new Date('2026-07-04T12:00:00Z'));

        expect(createEmptyDraft().frontmatter.date).toBe('2026-07-04');
    });

    it('starts with empty fields, not a draft, and the starter body', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-04T10:00:00Z'));

        expect(createEmptyDraft()).toEqual({
            frontmatter: {
                title: '',
                description: '',
                date: '2026-07-04',
                tags: [],
                tech: [],
                learn: [],
                draft: false,
            },
            body: STARTER_BODY,
        });
    });

    it('returns fresh arrays each call so drafts never share state', () => {
        const first = createEmptyDraft();
        const second = createEmptyDraft();

        first.frontmatter.tags.push('AI');

        expect(second.frontmatter.tags).toEqual([]);
    });

    it('seeds the body with an intro line above a first H2 section', () => {
        const lines = STARTER_BODY.split('\n');

        expect(lines[0]).not.toMatch(/^#/);
        expect(STARTER_BODY).toMatch(/^## First section$/m);
        expect(STARTER_BODY).not.toMatch(/^# /m);
    });
});
