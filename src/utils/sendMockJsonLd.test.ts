import { describe, expect, it } from 'vitest';
import {
    sendMockSoftwareId,
    sendMockRepoURL,
    sendMockURL,
    siteURL,
} from '@/config/constants';
import { sendMockJsonLd } from '@/utils/sendMockJsonLd';

describe('sendMockJsonLd', () => {
    it('describes the SendMock repository as source code', () => {
        expect(sendMockJsonLd['@context']).toBe('https://schema.org');
        expect(sendMockJsonLd['@type']).toBe('SoftwareSourceCode');
        expect(sendMockJsonLd['@id']).toBe(sendMockRepoURL);
        expect(sendMockJsonLd.codeRepository).toBe(sendMockRepoURL);
    });

    it('credits the site owner by the shared Person id', () => {
        expect(sendMockJsonLd.author).toEqual({ '@id': `${siteURL}#person` });
    });

    it('points at the app served from /sendmock/ by id only', () => {
        expect(sendMockSoftwareId).toBe(`${sendMockURL}#software`);
        expect(sendMockJsonLd.targetProduct).toEqual({
            '@id': sendMockSoftwareId,
        });
    });
});

describe('SendMock addresses', () => {
    it('serves SendMock from this domain, with the trailing slash Pages uses', () => {
        expect(sendMockURL).toBe(`${siteURL}/sendmock/`);
    });
});
