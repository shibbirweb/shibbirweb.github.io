import { describe, expect, it } from 'vitest';
import { captchaHint } from '@/components/pages/home/ContactArea/captchaHint';
import {
    captchaLoadingHint,
    captchaUnsolvedHint,
} from '@/components/pages/home/ContactArea/contents';

describe('captchaHint', () => {
    it('shows no hint once the captcha is solved', () => {
        expect(
            captchaHint({
                hasToken: true,
                hasInteracted: true,
                isWidgetRendered: true,
            })
        ).toBeNull();
        expect(
            captchaHint({
                hasToken: true,
                hasInteracted: false,
                isWidgetRendered: false,
            })
        ).toBeNull();
    });

    it('asks the visitor to solve a rendered but unsolved captcha', () => {
        expect(
            captchaHint({
                hasToken: false,
                hasInteracted: true,
                isWidgetRendered: true,
            })
        ).toBe(captchaUnsolvedHint);
    });

    it('says the captcha is loading after interaction but before it renders', () => {
        expect(
            captchaHint({
                hasToken: false,
                hasInteracted: true,
                isWidgetRendered: false,
            })
        ).toBe(captchaLoadingHint);
    });

    it('shows the unsolved hint, not the loading one, on an untouched form', () => {
        expect(
            captchaHint({
                hasToken: false,
                hasInteracted: false,
                isWidgetRendered: false,
            })
        ).toBe(captchaUnsolvedHint);
    });
});
