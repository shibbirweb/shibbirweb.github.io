import { WithContext, ProfilePage } from 'schema-dts';

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
    jsonLdAlternateName,
    jsonLdKnowsAbout,
} from '@/config/constants';

export const jsonLd: WithContext<ProfilePage> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: siteURL,
    dateCreated: new Date().toISOString(),
    datePublished: new Date().toISOString(),
    mainEntity: {
        '@type': 'Person',
        '@id': `${siteURL}#person`,
        name: siteName,
        alternateName: jsonLdAlternateName,
        url: siteURL,
        image: siteThumbnail,
        jobTitle: currentJobTitle,
        identifier: [
            {
                '@type': 'PropertyValue',
                propertyID: 'GitHub',
                value: githubURL,
            },
            {
                '@type': 'PropertyValue',
                propertyID: 'LinkedIn',
                value: linkedInURL,
            },
            {
                '@type': 'PropertyValue',
                propertyID: 'Facebook',
                value: facebookURL,
            },
            {
                '@type': 'PropertyValue',
                propertyID: 'Twitter',
                value: twitterURL,
            },
        ],
        worksFor: {
            '@type': 'Organization',
            '@id': `${currentWorkplaceURL}#org`,
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
            '@id': `${educationURL}#alumni`,
            name: education,
            url: educationURL,
        },
        description: jsonLdDescription,
        interactionStatistic: [
            {
                '@type': 'InteractionCounter',
                interactionType: {
                    '@type': 'FollowAction',
                },
                userInteractionCount: 15,
            },
            {
                '@type': 'InteractionCounter',
                interactionType: {
                    '@type': 'LikeAction',
                },
                userInteractionCount: 205,
            },
        ],
        agentInteractionStatistic: [
            {
                '@type': 'InteractionCounter',
                interactionType: {
                    '@type': 'WriteAction',
                },
                userInteractionCount: 66,
            },
        ],
        knowsAbout: jsonLdKnowsAbout,
    },
};
