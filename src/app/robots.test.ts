import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import { siteURL } from '@/config/constants';

describe('robots', () => {
    it('allows every crawler everywhere', () => {
        expect(robots().rules).toEqual({ userAgent: '*', allow: '/' });
    });

    it('lists this site sitemap and the SendMock sitemap on the same domain', () => {
        expect(robots().sitemap).toEqual([
            `${siteURL}/sitemap.xml`,
            `${siteURL}/sendmock/sitemap.xml`,
        ]);
    });
});
