import {
    captchaLoadingHint,
    captchaUnsolvedHint,
} from '@/components/pages/home/ContactArea/contents';

type CaptchaHintArgs = {
    hasToken: boolean;
    hasInteracted: boolean;
    isWidgetRendered: boolean;
};

/**
 * The line under the submit button explaining why it is disabled, or null once it
 * is not. Four states, so this is a helper with early returns rather than a stack
 * of ternaries in the JSX.
 *
 * The untouched form falls through to the unsolved hint rather than the loading
 * one: nothing is downloading yet, and the reason the button is disabled really is
 * that the captcha is not done.
 */
export function captchaHint({
    hasToken,
    hasInteracted,
    isWidgetRendered,
}: CaptchaHintArgs): string | null {
    if (hasToken) {
        return null;
    }
    if (isWidgetRendered) {
        return captchaUnsolvedHint;
    }
    if (hasInteracted) {
        return captchaLoadingHint;
    }
    return captchaUnsolvedHint;
}
