import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
    useGiscus,
    type GiscusConfig,
} from '@/components/pages/articles/Comments/hooks/useGiscus';

const config: GiscusConfig = {
    repo: 'owner/repo',
    repoId: 'R_repo',
    category: 'Comments',
    categoryId: 'DIC_category',
};

function Widget() {
    const containerRef = useRef<HTMLDivElement>(null);
    useGiscus(containerRef, config);
    return (
        <div
            data-testid="giscus"
            ref={containerRef}
        />
    );
}

function giscusScript(container: HTMLElement): HTMLScriptElement {
    return container.querySelector('script') as HTMLScriptElement;
}

function switchTheme(theme: 'light' | 'dark') {
    act(() => {
        document.documentElement.dataset.theme = theme;
        window.dispatchEvent(new Event('themepreferencechange'));
    });
}

describe('useGiscus', () => {
    it('injects the giscus client script into the container', () => {
        const { getByTestId } = render(<Widget />);

        const script = giscusScript(getByTestId('giscus'));
        expect(script.src).toBe('https://giscus.app/client.js');
        expect(script.async).toBe(true);
        expect(script.crossOrigin).toBe('anonymous');
    });

    it('passes the repo and category config and maps threads by pathname', () => {
        const { getByTestId } = render(<Widget />);

        const script = giscusScript(getByTestId('giscus'));
        expect(script.dataset.repo).toBe('owner/repo');
        expect(script.dataset.repoId).toBe('R_repo');
        expect(script.dataset.category).toBe('Comments');
        expect(script.dataset.categoryId).toBe('DIC_category');
        expect(script.dataset.mapping).toBe('pathname');
        expect(script.dataset.loading).toBe('lazy');
    });

    it('points the theme at the site stylesheet for the resolved theme', () => {
        document.documentElement.dataset.theme = 'dark';

        const { getByTestId } = render(<Widget />);

        expect(giscusScript(getByTestId('giscus')).dataset.theme).toBe(
            `${window.location.origin}/giscus-dark.css`
        );
    });

    it('uses the light stylesheet on the light theme', () => {
        document.documentElement.dataset.theme = 'light';

        const { getByTestId } = render(<Widget />);

        expect(giscusScript(getByTestId('giscus')).dataset.theme).toBe(
            `${window.location.origin}/giscus-light.css`
        );
    });

    it('posts setConfig with the new theme to the loaded iframe on a theme change', () => {
        document.documentElement.dataset.theme = 'light';
        const { getByTestId } = render(<Widget />);
        const frame = document.createElement('iframe');
        frame.className = 'giscus-frame';
        getByTestId('giscus').appendChild(frame);
        const postMessage = vi.spyOn(frame.contentWindow!, 'postMessage');

        switchTheme('dark');

        expect(postMessage).toHaveBeenCalledWith(
            {
                giscus: {
                    setConfig: {
                        theme: `${window.location.origin}/giscus-dark.css`,
                    },
                },
            },
            'https://giscus.app'
        );
    });

    it('does not fail on a theme change before the iframe has loaded', () => {
        render(<Widget />);

        expect(() => switchTheme('dark')).not.toThrow();
    });

    it('clears the container and stops syncing on unmount', () => {
        const { getByTestId, unmount } = render(<Widget />);
        const container = getByTestId('giscus');
        const frame = document.createElement('iframe');
        frame.className = 'giscus-frame';
        container.appendChild(frame);
        const postMessage = vi.spyOn(frame.contentWindow!, 'postMessage');

        unmount();
        switchTheme('dark');

        expect(container).toBeEmptyDOMElement();
        expect(postMessage).not.toHaveBeenCalled();
    });

    it('never double-injects across a remount', () => {
        const { getByTestId, rerender } = render(<Widget />);
        rerender(<Widget />);

        expect(getByTestId('giscus').querySelectorAll('script')).toHaveLength(
            1
        );
    });
});
