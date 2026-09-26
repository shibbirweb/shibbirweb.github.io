import { describe, expect, it } from 'vitest';
import {
    facebookURL,
    githubURL,
    jsonLdKnowsAbout,
    linkedInURL,
    siteAuthorEmail,
    siteName,
    siteURL,
    twitterURL,
} from '@/config/constants';
import { jsonLd } from '@/utils/jsonLd';

type PersonRecord = Record<string, unknown>;

const person = jsonLd.mainEntity as PersonRecord;

describe('jsonLd (home ProfilePage)', () => {
    it('is a ProfilePage at the site root', () => {
        expect(jsonLd['@context']).toBe('https://schema.org');
        expect(jsonLd['@type']).toBe('ProfilePage');
        expect(jsonLd.url).toBe(siteURL);
    });

    it('stamps dateModified with a valid ISO timestamp', () => {
        const modified = jsonLd.dateModified as string;
        expect(Number.isNaN(Date.parse(modified))).toBe(false);
    });

    it('describes the site owner as the shared Person entity', () => {
        expect(person['@type']).toBe('Person');
        expect(person['@id']).toBe(`${siteURL}#person`);
        expect(person.name).toBe(siteName);
        expect(person.knowsAbout).toEqual(jsonLdKnowsAbout);
    });

    it('lists every social profile and the email in sameAs', () => {
        expect(person.sameAs).toEqual([
            linkedInURL,
            githubURL,
            facebookURL,
            twitterURL,
            `mailto:${siteAuthorEmail}`,
        ]);
    });

    it('identifies each social profile by platform', () => {
        const identifiers = person.identifier as Array<{
            propertyID: string;
            value: string;
        }>;
        expect(identifiers.map((identifier) => identifier.propertyID)).toEqual([
            'GitHub',
            'LinkedIn',
            'Facebook',
            'Twitter',
        ]);
        expect(identifiers.map((identifier) => identifier.value)).toEqual([
            githubURL,
            linkedInURL,
            facebookURL,
            twitterURL,
        ]);
    });

    it('serialises to JSON without loss', () => {
        expect(JSON.parse(JSON.stringify(jsonLd))).toEqual(jsonLd);
    });
});
