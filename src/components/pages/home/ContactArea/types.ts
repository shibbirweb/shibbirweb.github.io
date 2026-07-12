export type ContactFormValues = {
    name: string;
    email: string;
    message: string;
};

export type ContactStatus = 'idle' | 'submitting' | 'success' | 'error';

/** Minimal shape of the hCaptcha API surface we use, injected on `window` by
 * the hCaptcha script. Widget ids are opaque strings. */
export type HCaptchaApi = {
    render: (
        container: HTMLElement,
        params: {
            sitekey: string;
            theme?: 'light' | 'dark';
            callback?: (token: string) => void;
            'expired-callback'?: () => void;
            'error-callback'?: () => void;
        }
    ) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId: string) => void;
};

declare global {
    interface Window {
        hcaptcha?: HCaptchaApi;
    }
}
