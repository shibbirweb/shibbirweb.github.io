import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hcaptchaSiteKey } from '@/config/constants';
import type { HCaptchaApi } from '@/components/pages/home/ContactArea/types';

type UseHCaptcha =
    typeof import('@/components/pages/home/ContactArea/hooks/useHCaptcha').useHCaptcha;

type RenderParams = Parameters<HCaptchaApi['render']>[1];

const scriptSelector = 'script[src^="https://js.hcaptcha.com/"]';

function getInjectedScripts() {
    return document.head.querySelectorAll<HTMLScriptElement>(scriptSelector);
}

function createHCaptchaApi() {
    const renderCalls: { container: HTMLElement; params: RenderParams }[] = [];
    const api = {
        render: vi.fn((container: HTMLElement, params: RenderParams) => {
            renderCalls.push({ container, params });
            return `widget-${renderCalls.length}`;
        }),
        reset: vi.fn(),
        remove: vi.fn(),
    };
    return { api, renderCalls };
}

describe('useHCaptcha', () => {
    let useHCaptcha: UseHCaptcha;

    function CaptchaHarness({
        shouldLoad,
        showContainer = true,
    }: {
        shouldLoad: boolean;
        showContainer?: boolean;
    }) {
        const { setContainer, token, reset, isWidgetRendered } = useHCaptcha({
            shouldLoad,
        });

        return (
            <div>
                {showContainer && (
                    <div
                        ref={setContainer}
                        data-testid="captcha-slot"
                    />
                )}
                <output aria-label="token">{token ?? 'none'}</output>
                <output aria-label="rendered">
                    {isWidgetRendered ? 'yes' : 'no'}
                </output>
                <button
                    type="button"
                    onClick={reset}
                >
                    Reset
                </button>
            </div>
        );
    }

    function readOutput(name: string) {
        return screen.getByRole('status', { name }).textContent;
    }

    async function finishScriptLoad(api: HCaptchaApi) {
        window.hcaptcha = api;
        const [script] = getInjectedScripts();
        await act(async () => {
            script.onload?.(new Event('load'));
        });
    }

    beforeEach(async () => {
        // The script promise is module state, so each test gets a fresh copy.
        vi.resetModules();
        ({ useHCaptcha } = await import(
            '@/components/pages/home/ContactArea/hooks/useHCaptcha'
        ));
    });

    afterEach(() => {
        getInjectedScripts().forEach((script) => script.remove());
        delete window.hcaptcha;
    });

    it('does not fetch the script while the gate is closed', () => {
        render(<CaptchaHarness shouldLoad={false} />);

        expect(getInjectedScripts()).toHaveLength(0);
        expect(readOutput('rendered')).toBe('no');
    });

    it('injects the explicit-render script once the gate opens', () => {
        const { rerender } = render(<CaptchaHarness shouldLoad={false} />);

        rerender(<CaptchaHarness shouldLoad />);

        const scripts = getInjectedScripts();
        expect(scripts).toHaveLength(1);
        expect(scripts[0].src).toBe(
            'https://js.hcaptcha.com/1/api.js?render=explicit'
        );
        expect(scripts[0].async).toBe(true);
    });

    it('injects the script only once across instances and re-renders', () => {
        const { rerender } = render(
            <>
                <CaptchaHarness shouldLoad />
                <CaptchaHarness shouldLoad />
            </>
        );
        rerender(
            <>
                <CaptchaHarness shouldLoad />
                <CaptchaHarness shouldLoad />
            </>
        );

        expect(getInjectedScripts()).toHaveLength(1);
    });

    it('skips the script when the API is already on the page', async () => {
        const { api, renderCalls } = createHCaptchaApi();
        window.hcaptcha = api;

        await act(async () => {
            render(<CaptchaHarness shouldLoad />);
        });

        expect(getInjectedScripts()).toHaveLength(0);
        expect(renderCalls).toHaveLength(1);
    });

    it('renders the widget into the container with the site key and theme', async () => {
        const { api, renderCalls } = createHCaptchaApi();
        render(<CaptchaHarness shouldLoad />);

        await finishScriptLoad(api);

        expect(renderCalls).toHaveLength(1);
        expect(renderCalls[0].container).toBe(
            screen.getByTestId('captcha-slot')
        );
        expect(renderCalls[0].params.sitekey).toBe(hcaptchaSiteKey);
        expect(renderCalls[0].params.theme).toBe('light');
        expect(readOutput('rendered')).toBe('yes');
    });

    it('renders a dark widget on a dark page', async () => {
        document.documentElement.dataset.theme = 'dark';
        const { api, renderCalls } = createHCaptchaApi();
        render(<CaptchaHarness shouldLoad />);

        await finishScriptLoad(api);

        expect(renderCalls[0].params.theme).toBe('dark');
    });

    it('exposes the solved token and clears it when it expires', async () => {
        const { api, renderCalls } = createHCaptchaApi();
        render(<CaptchaHarness shouldLoad />);
        await finishScriptLoad(api);

        act(() => renderCalls[0].params.callback?.('solved-token'));
        expect(readOutput('token')).toBe('solved-token');

        act(() => renderCalls[0].params['expired-callback']?.());
        expect(readOutput('token')).toBe('none');
    });

    it('clears the token when the widget errors', async () => {
        const { api, renderCalls } = createHCaptchaApi();
        render(<CaptchaHarness shouldLoad />);
        await finishScriptLoad(api);

        act(() => renderCalls[0].params.callback?.('solved-token'));
        act(() => renderCalls[0].params['error-callback']?.());

        expect(readOutput('token')).toBe('none');
    });

    it('resets the widget and drops the used token', async () => {
        const { api, renderCalls } = createHCaptchaApi();
        render(<CaptchaHarness shouldLoad />);
        await finishScriptLoad(api);
        act(() => renderCalls[0].params.callback?.('solved-token'));

        act(() => screen.getByRole('button', { name: 'Reset' }).click());

        expect(api.reset).toHaveBeenCalledWith('widget-1');
        expect(readOutput('token')).toBe('none');
    });

    it('removes the widget when its container unmounts', async () => {
        const { api } = createHCaptchaApi();
        const { rerender } = render(<CaptchaHarness shouldLoad />);
        await finishScriptLoad(api);

        rerender(
            <CaptchaHarness
                shouldLoad
                showContainer={false}
            />
        );

        expect(api.remove).toHaveBeenCalledWith('widget-1');
        expect(readOutput('rendered')).toBe('no');
    });

    it('re-renders the widget when the site theme changes', async () => {
        const { api, renderCalls } = createHCaptchaApi();
        render(<CaptchaHarness shouldLoad />);
        await finishScriptLoad(api);

        await act(async () => {
            document.documentElement.dataset.theme = 'dark';
            window.dispatchEvent(new Event('themepreferencechange'));
        });

        expect(api.remove).toHaveBeenCalledWith('widget-1');
        expect(renderCalls).toHaveLength(2);
        expect(renderCalls[1].params.theme).toBe('dark');
    });

    it('stays unrendered when the script fails, and retries later', async () => {
        const { rerender } = render(<CaptchaHarness shouldLoad />);
        const [failedScript] = getInjectedScripts();

        await act(async () => {
            failedScript.onerror?.(new Event('error'));
        });
        expect(readOutput('rendered')).toBe('no');
        expect(readOutput('token')).toBe('none');

        rerender(
            <CaptchaHarness
                shouldLoad
                showContainer={false}
            />
        );
        rerender(<CaptchaHarness shouldLoad />);

        expect(getInjectedScripts()).toHaveLength(2);
    });
});
