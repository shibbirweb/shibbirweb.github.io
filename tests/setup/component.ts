import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// next/font only works inside the Next.js compiler, so components that read a
// font's `.variable` class get a plain stand-in.
vi.mock('@/config/fonts', () => ({
    notoSans: { variable: 'font-noto-sans', className: 'font-noto-sans' },
    zain: { variable: 'font-zain', className: 'font-zain' },
}));
vi.mock('@/config/monoFont', () => ({
    jetBrainsMono: {
        variable: 'font-jetbrains-mono',
        className: 'font-jetbrains-mono',
    },
}));

// jsdom has no layout engine, so the browser APIs components use for scroll
// and visibility tracking are stubbed with inert versions.
class InertIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}
class InertResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

if (!('IntersectionObserver' in window)) {
    vi.stubGlobal('IntersectionObserver', InertIntersectionObserver);
}
if (!('ResizeObserver' in window)) {
    vi.stubGlobal('ResizeObserver', InertResizeObserver);
}
if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }),
    });
}
if (!window.scrollTo) {
    window.scrollTo = () => {};
}
if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
    cleanup();
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
});
