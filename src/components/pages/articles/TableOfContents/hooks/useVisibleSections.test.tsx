import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVisibleSections } from '@/components/pages/articles/TableOfContents/hooks/useVisibleSections';

const ids = ['intro', 'setup', 'wrap-up'];

/** Positions an element as if laid out at `top`..`bottom` in the viewport. */
function place(element: HTMLElement, top: number, bottom = top) {
    element.getBoundingClientRect = () => ({ top, bottom }) as DOMRect;
}

function buildArticle(tops: number[], contentBottom: number) {
    const body = document.createElement('div');
    ids.forEach((id, index) => {
        const heading = document.createElement('h2');
        heading.id = id;
        place(heading, tops[index]);
        body.appendChild(heading);
    });
    place(body, 0, contentBottom);
    document.body.appendChild(body);
    return body;
}

beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        callback(0);
        return 0;
    });
    Object.defineProperty(window, 'innerHeight', {
        value: 900,
        configurable: true,
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

describe('useVisibleSections', () => {
    it('lists the sections on screen', () => {
        buildArticle([100, 600, 1200], 1500);

        const { result } = renderHook(() => useVisibleSections(ids));

        expect(result.current).toEqual(['intro', 'setup']);
    });

    it('updates as the page scrolls', () => {
        const body = buildArticle([100, 600, 1200], 1500);
        const { result } = renderHook(() => useVisibleSections(ids));

        const headings = body.querySelectorAll('h2');
        place(headings[0], -900);
        place(headings[1], -400);
        place(headings[2], 200);
        place(body, -1000, 500);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });

        expect(result.current).toEqual(['setup', 'wrap-up']);
    });

    it('is empty when none of the headings are on the page', () => {
        const { result } = renderHook(() => useVisibleSections(ids));

        expect(result.current).toEqual([]);
    });
});
