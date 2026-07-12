import { useCallback, useEffect, useRef, useState } from 'react';
import { hcaptchaSiteKey } from '@/config/constants';
import { useResolvedTheme } from '@/components/layout/ThemeToggle/hooks/useResolvedTheme';
import type { ResolvedTheme } from '@/components/layout/ThemeToggle/theme';

const HCAPTCHA_SCRIPT_SRC = 'https://js.hcaptcha.com/1/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

/**
 * Loads the hCaptcha API script exactly once (guarded by a module-level
 * promise) and resolves when `window.hcaptcha` is ready. SSR-safe: it only
 * touches the DOM in the browser.
 */
function loadHCaptchaScript(): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.resolve();
    }
    if (window.hcaptcha) {
        return Promise.resolve();
    }
    if (scriptPromise) {
        return scriptPromise;
    }

    scriptPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = HCAPTCHA_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => {
            scriptPromise = null;
            reject(new Error('Failed to load hCaptcha'));
        };
        document.head.appendChild(script);
    });

    return scriptPromise;
}

/**
 * Renders an hCaptcha widget and exposes its response token. Attach the returned
 * `setContainer` as a `ref` to a div; being a callback ref it fires with the
 * node on mount and null on unmount, so the widget is created and torn down in
 * step with the container (keeping the success/resend remount correct).
 *
 * The widget's theme is baked in at render time, so it also tracks the site
 * theme: when the user switches light/dark the widget is removed and re-rendered
 * with the new theme so it always matches the surrounding UI. Read `token` to
 * know the challenge is solved; call `reset()` to clear a solved (single-use)
 * token.
 */
export function useHCaptcha() {
    const widgetIdRef = useRef<string | null>(null);
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const renderedThemeRef = useRef<ResolvedTheme | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const theme = useResolvedTheme();
    // Read the latest theme from inside async callbacks without re-creating them.
    const themeRef = useRef<ResolvedTheme>(theme);
    themeRef.current = theme;

    const renderWidget = useCallback(() => {
        const node = nodeRef.current;
        if (!node) {
            return;
        }
        loadHCaptchaScript()
            .then(() => {
                if (
                    !node.isConnected ||
                    !window.hcaptcha ||
                    widgetIdRef.current !== null
                ) {
                    return;
                }
                const activeTheme = themeRef.current;
                widgetIdRef.current = window.hcaptcha.render(node, {
                    sitekey: hcaptchaSiteKey,
                    theme: activeTheme,
                    callback: (value: string) => setToken(value),
                    'expired-callback': () => setToken(null),
                    'error-callback': () => setToken(null),
                });
                renderedThemeRef.current = activeTheme;
            })
            .catch(() => {
                // Token stays null, so the submit button stays disabled and the
                // missing-captcha hint remains visible.
            });
    }, []);

    const removeWidget = useCallback(() => {
        if (widgetIdRef.current !== null && window.hcaptcha) {
            window.hcaptcha.remove(widgetIdRef.current);
        }
        widgetIdRef.current = null;
        renderedThemeRef.current = null;
        setToken(null);
    }, []);

    const setContainer = useCallback(
        (node: HTMLDivElement | null) => {
            nodeRef.current = node;
            if (node) {
                renderWidget();
            } else {
                removeWidget();
            }
        },
        [renderWidget, removeWidget]
    );

    // Re-render with the new theme whenever it changes and a widget is mounted.
    useEffect(() => {
        if (
            widgetIdRef.current !== null &&
            renderedThemeRef.current !== theme
        ) {
            removeWidget();
            renderWidget();
        }
    }, [theme, renderWidget, removeWidget]);

    const reset = useCallback(() => {
        setToken(null);
        if (widgetIdRef.current !== null && window.hcaptcha) {
            window.hcaptcha.reset(widgetIdRef.current);
        }
    }, []);

    return { setContainer, token, reset };
}
