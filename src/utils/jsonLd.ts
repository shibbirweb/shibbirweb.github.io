import { Person, WithContext } from 'schema-dts';

import {
    currentJobTitle,
    currentWorkplace,
    currentWorkplaceURL,
    education,
    educationURL,
    facebookURL,
    githubURL,
    twitterURL,
    jsonLdDescription,
    linkedInURL,
    siteAuthorEmail,
    siteName,
    siteThumbnail,
    siteURL,
} from '@/config/constants';

export const jsonLd: WithContext<Person> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteName,
    url: siteURL,
    image: siteThumbnail,
    jobTitle: currentJobTitle,
    worksFor: {
        '@type': 'Organization',
        name: currentWorkplace,
        url: currentWorkplaceURL,
    },
    sameAs: [
        linkedInURL,
        githubURL,
        facebookURL,
        twitterURL,
        `mailto:${siteAuthorEmail}`,
    ],
    alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: education,
        url: educationURL,
    },
    description: jsonLdDescription,
};
