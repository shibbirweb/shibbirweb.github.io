import { describe, expect, it } from 'vitest';
import {
    currentJobTitle,
    jsonLdKnowsAbout,
    siteName,
    siteURL,
} from '@/config/constants';
import { jsonLd } from '@/utils/jsonLd';
import { resumeJsonLd } from '@/utils/resumeJsonLd';

type PersonRecord = Record<string, unknown>;

const person = resumeJsonLd.mainEntity as PersonRecord;

describe('resumeJsonLd', () => {
    it('is a ProfilePage at the /resume URL', () => {
        expect(resumeJsonLd['@type']).toBe('ProfilePage');
        expect(resumeJsonLd.url).toBe(`${siteURL}/resume`);
        expect(resumeJsonLd.name).toBe(`Resume | ${siteName}`);
    });

    it('reuses the same Person @id as the home ProfilePage', () => {
        const homePerson = jsonLd.mainEntity as PersonRecord;
        expect(person['@id']).toBe(`${siteURL}#person`);
        expect(person['@id']).toBe(homePerson['@id']);
    });

    it('adds an Occupation built from the job title and skills', () => {
        expect(person.hasOccupation).toMatchObject({
            '@type': 'Occupation',
            name: currentJobTitle,
            skills: jsonLdKnowsAbout,
        });
    });

    it('carries the same social profiles as the home page', () => {
        const homePerson = jsonLd.mainEntity as PersonRecord;
        expect(person.sameAs).toEqual(homePerson.sameAs);
    });
});
