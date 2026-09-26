import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    currentWorkplaceURL,
    defaultThumbnail,
    educationURL,
    facebookURL,
    githubURL,
    jsonLdKnowsAbout,
    linkedInURL,
    resumeThumbnail,
    siteAuthorEmail,
    siteKeywords,
    siteThumbnail,
    siteURL,
    twitterURL,
    twitterUsername,
} from '@/config/constants';

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
});

function duplicatesIn(values: string[]): string[] {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const value of values) {
        const key = value.toLowerCase();
        if (seen.has(key)) {
            duplicates.push(value);
        }
        seen.add(key);
    }
    return duplicates;
}

describe('site constants', () => {
    it('serves siteURL over https with no trailing slash', () => {
        expect(siteURL.startsWith('https://')).toBe(true);
        expect(siteURL.endsWith('/')).toBe(false);
        expect(() => new URL(siteURL)).not.toThrow();
    });

    it('uses https for every social and external profile URL', () => {
        for (const url of [
            linkedInURL,
            githubURL,
            facebookURL,
            twitterURL,
            currentWorkplaceURL,
            educationURL,
        ]) {
            expect(new URL(url).protocol).toBe('https:');
        }
    });

    it('builds share thumbnails on the site origin', () => {
        for (const thumbnail of [
            siteThumbnail,
            resumeThumbnail,
            defaultThumbnail,
        ]) {
            expect(thumbnail.startsWith(`${siteURL}/images/`)).toBe(true);
        }
    });

    it('has a plausible author email', () => {
        expect(siteAuthorEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('writes the Twitter handle with a leading @', () => {
        expect(twitterUsername).toMatch(/^@\w+$/);
    });

    it('has no duplicate SEO keywords', () => {
        expect(duplicatesIn(siteKeywords)).toEqual([]);
    });

    it('has no duplicate knowsAbout entries', () => {
        expect(duplicatesIn(jsonLdKnowsAbout)).toEqual([]);
    });
});

describe('careerExperience', () => {
    it('is a positive whole number of years for a real build stamp', async () => {
        vi.stubEnv('NEXT_PUBLIC_BUILD_TIME', '2026-09-26T00:00:00.000Z');
        vi.resetModules();
        const { careerExperience } = await import('@/config/constants');
        expect(Number.isInteger(careerExperience)).toBe(true);
        expect(careerExperience).toBeGreaterThan(0);
        expect(careerExperience).toBe(7);
    });

    it('is derived from the build year, not the current date', async () => {
        vi.stubEnv('NEXT_PUBLIC_BUILD_TIME', '2030-01-01T00:00:00.000Z');
        vi.resetModules();
        const { careerExperience } = await import('@/config/constants');
        expect(careerExperience).toBe(11);
    });
});
