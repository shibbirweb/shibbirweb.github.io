import { describe, expect, it } from 'vitest';
import { shareTargets } from '@/components/pages/articles/ShareMenu/contents';
import { twitterUsername } from '@/config/constants';

const pageUrl = 'https://shibbir.me/articles/a-post?ref=share&x=1';
const pageTitle = 'Tom & Jerry: a "story" #1';

function shareUrlFor(targetName: string): URL {
    const target = shareTargets.find((entry) => entry.name === targetName);
    if (!target) {
        throw new Error(`No share target named ${targetName}`);
    }
    return new URL(target.buildShareUrl({ url: pageUrl, title: pageTitle }));
}

describe('shareTargets', () => {
    it('lists the platforms in menu order', () => {
        expect(shareTargets.map((target) => target.name)).toEqual([
            'X',
            'LinkedIn',
            'Facebook',
            'WhatsApp',
        ]);
    });

    it('builds https share URLs for every target', () => {
        for (const target of shareTargets) {
            const shareUrl = target.buildShareUrl({
                url: pageUrl,
                title: pageTitle,
            });
            expect(new URL(shareUrl).protocol).toBe('https:');
        }
    });

    it('encodes the page URL and title for X and credits the handle with via=', () => {
        const shareUrl = shareUrlFor('X');
        expect(shareUrl.hostname).toBe('twitter.com');
        expect(shareUrl.searchParams.get('url')).toBe(pageUrl);
        expect(shareUrl.searchParams.get('text')).toBe(pageTitle);
        expect(shareUrl.searchParams.get('via')).toBe(
            twitterUsername.replace('@', '')
        );
        expect([...shareUrl.searchParams.keys()]).toEqual([
            'url',
            'text',
            'via',
        ]);
    });

    it('encodes the page URL for LinkedIn', () => {
        const shareUrl = shareUrlFor('LinkedIn');
        expect(shareUrl.hostname).toBe('www.linkedin.com');
        expect(shareUrl.searchParams.get('url')).toBe(pageUrl);
    });

    it('encodes the page URL for Facebook', () => {
        const shareUrl = shareUrlFor('Facebook');
        expect(shareUrl.hostname).toBe('www.facebook.com');
        expect(shareUrl.searchParams.get('u')).toBe(pageUrl);
    });

    it('sends the title and URL together as WhatsApp text', () => {
        const shareUrl = shareUrlFor('WhatsApp');
        expect(shareUrl.hostname).toBe('wa.me');
        expect(shareUrl.searchParams.get('text')).toBe(
            `${pageTitle} ${pageUrl}`
        );
    });

    it('never leaks raw query characters from the page URL into the share URL', () => {
        for (const target of shareTargets) {
            const shareUrl = target.buildShareUrl({
                url: pageUrl,
                title: pageTitle,
            });
            expect(shareUrl).not.toContain('ref=share');
        }
    });
});
