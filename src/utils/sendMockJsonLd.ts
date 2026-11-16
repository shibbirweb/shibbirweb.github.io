import type { SoftwareSourceCode, WithContext } from 'schema-dts';

import {
    sendMockSoftwareId,
    sendMockDescription,
    sendMockProgrammingLanguages,
    sendMockRepoURL,
    siteURL,
} from '@/config/constants';

/**
 * SendMock's source code, credited to the site owner. It ties the person on this
 * site (`#person`) to the SendMock app served from /sendmock/, which describes
 * itself on its own pages. The app is only referenced by `@id`, never redefined
 * here, so the two sites never disagree about it.
 */
export const sendMockJsonLd: WithContext<SoftwareSourceCode> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    '@id': sendMockRepoURL,
    name: 'SendMock',
    description: sendMockDescription,
    url: sendMockRepoURL,
    codeRepository: sendMockRepoURL,
    programmingLanguage: sendMockProgrammingLanguages,
    author: { '@id': `${siteURL}#person` },
    targetProduct: { '@id': sendMockSoftwareId },
};
