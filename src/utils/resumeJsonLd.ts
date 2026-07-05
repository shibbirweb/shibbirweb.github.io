import { WithContext, ProfilePage } from 'schema-dts';

import {
    addressCountry,
    currentJobTitle,
    currentWorkplace,
    currentWorkplaceURL,
    education,
    educationURL,
    facebookURL,
    githubURL,
    jsonLdAlternateName,
    jsonLdDescription,
    jsonLdKnowsAbout,
    linkedInURL,
    personFamilyName,
    personGivenName,
    siteAuthorEmail,
    siteName,
    siteThumbnail,
    siteURL,
    twitterURL,
} from '@/config/constants';

const resumeURL = `${siteURL}/resume`;

// ProfilePage for the /resume route. It reuses the same Person `@id`
// (`${siteURL}#person`) as the global home-page ProfilePage in `jsonLd.ts`, so
// search engines treat both pages as describing one entity, and adds
// resume-specific signals (`hasOccupation`, `worksFor`, `alumniOf`, `knowsAbout`)
// that make the page eligible for richer person/resume results.
export const resumeJsonLd: WithContext<ProfilePage> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: resumeURL,
    name: `Resume | ${siteName}`,
    dateModified: new Date().toISOString(),
    mainEntity: {
        '@type': 'Person',
        '@id': `${siteURL}#person`,
        name: siteName,
        givenName: personGivenName,
        familyName: personFamilyName,
        alternateName: jsonLdAlternateName,
        url: siteURL,
        image: siteThumbnail,
        jobTitle: currentJobTitle,
        description: jsonLdDescription,
        address: {
            '@type': 'PostalAddress',
            addressCountry,
        },
        hasOccupation: {
            '@type': 'Occupation',
            name: currentJobTitle,
            occupationLocation: {
                '@type': 'Country',
                name: addressCountry,
            },
            skills: jsonLdKnowsAbout,
        },
        worksFor: {
            '@type': 'Organization',
            '@id': `${currentWorkplaceURL}#org`,
            name: currentWorkplace,
            url: currentWorkplaceURL,
        },
        alumniOf: {
            '@type': 'CollegeOrUniversity',
            '@id': `${educationURL}#alumni`,
            name: education,
            url: educationURL,
        },
        knowsAbout: jsonLdKnowsAbout,
        sameAs: [
            linkedInURL,
            githubURL,
            facebookURL,
            twitterURL,
            `mailto:${siteAuthorEmail}`,
        ],
    },
};
