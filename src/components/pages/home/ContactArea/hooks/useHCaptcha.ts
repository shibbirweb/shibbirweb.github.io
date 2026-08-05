import { useCallback, useEffect, useRef, useState } from 'react';
import { hcaptchaSiteKey } from '@/config/constants';
import { useResolvedTheme } from '@/components/layout/ThemeToggle/hooks/useResolvedTheme';
import type { ResolvedTheme } from '@/components/layout/ThemeToggle/theme';

const HCAPTCHA_SCRIPT_SRC = 'https://js.hcaptcha.com/1/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

type UseHCaptchaArgs = {
    /**
     * Opens the gate on the vendor script. The caller owns the latch and is
     * responsible for keeping it one-way: flipping it back would strand a
     * rendered widget with no way to reach it.
     */
    shouldLoad: boolean;
};

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
 * The vendor script is not fetched until `shouldLoad` opens. The container
 * mounts with the rest of the form, long before anyone wants a captcha, and this
 * is third-party JS nobody who only reads the page should have to download, so
 * the caller decides when it is worth the bytes. Deferring past the first commit
 * also means `useResolvedTheme` has already corrected itself, so a dark-mode
 * visitor no longer gets a light widget rendered and immediately replaced.
 *
 * The widget's theme is baked in at render time, so it also tracks the site
 * theme: when the user switches light/dark the widget is removed and re-rendered
 * with the new theme so it always matches the surrounding UI. Read `token` to
 * know the challenge is solved; call `reset()` to clear a solved (single-use)
 * token. `isWidgetRendered` says whether the widget is on screen yet, so the
 * caller can hold a placeholder in its place.
 */
export function useHCaptcha({ shouldLoad }: UseHCaptchaArgs) {
    const widgetIdRef = useRef<string | null>(null);
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const renderedThemeRef = useRef<ResolvedTheme | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isWidgetRendered, setIsWidgetRendered] = useState(false);

    const theme = useResolvedTheme();
    // Read the latest theme from inside async callbacks without re-creating them.
    const themeRef = useRef<ResolvedTheme>(theme);
    themeRef.current = theme;

    // Same idiom as themeRef, and here it is load bearing: reading the gate from
    // a ref keeps renderWidget and removeWidget out of any dependency array, so
    // setContainer holds one identity for the life of the component. Were that
    // identity to change, React would call the old callback ref with null (tearing
    // the widget down and dropping a solved token) before calling the new one.
    const shouldLoadRef = useRef(shouldLoad);
    shouldLoadRef.current = shouldLoad;

    const renderWidget = useCallback(() => {
        const node = nodeRef.current;
        if (!node || !shouldLoadRef.current) {
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
                setIsWidgetRendered(true);
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
        setIsWidgetRendered(false);
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

    // The container mounts long before the widget is wanted, so the ref callback's
    // renderWidget call bails on the closed gate. This is the other way in: the
    // moment the caller opens it. renderWidget is []-stable, so this only runs on a
    // real flip, and if the gate is already open when the container mounts the
    // widgetIdRef check inside renderWidget makes the duplicate call a no-op.
    useEffect(() => {
        if (shouldLoad) {
            renderWidget();
        }
    }, [shouldLoad, renderWidget]);

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

    return { setContainer, token, reset, isWidgetRendered };
}
