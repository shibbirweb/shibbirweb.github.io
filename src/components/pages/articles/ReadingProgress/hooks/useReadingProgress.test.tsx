import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useReadingProgress } from '@/components/pages/articles/ReadingProgress/hooks/useReadingProgress';

const VIEWPORT_HEIGHT = 800;

let article: HTMLElement;
let articleRect = { top: 0, height: 0 };

function setArticleRect(top: number, height: number) {
    articleRect = { top, height };
}

function scrollAndSettle() {
    act(() => {
        window.dispatchEvent(new Event('scroll'));
        vi.advanceTimersByTime(16);
    });
}

beforeEach(() => {
    vi.useFakeTimers({
        toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(VIEWPORT_HEIGHT);
    article = document.createElement('article');
    document.body.appendChild(article);
    vi.spyOn(article, 'getBoundingClientRect').mockImplementation(
        () => articleRect as DOMRect
    );
    setArticleRect(0, 2800);
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    article.remove();
});

describe('useReadingProgress', () => {
    it('stays at 0 when the page has no article', () => {
        article.remove();

        const { result } = renderHook(() => useReadingProgress());

        expect(result.current).toBe(0);
    });

    it('measures on mount: the top of the article is 0', () => {
        const { result } = renderHook(() => useReadingProgress());

        expect(result.current).toBe(0);
    });

    it('reports the scrolled fraction of the article on scroll', () => {
        const { result } = renderHook(() => useReadingProgress());

        // 2800 tall in an 800 viewport leaves 2000px to scroll through.
        setArticleRect(-500, 2800);
        scrollAndSettle();

        expect(result.current).toBe(0.25);
    });

    it('clamps to 1 past the end and 0 before the start', () => {
        const { result } = renderHook(() => useReadingProgress());

        setArticleRect(-5000, 2800);
        scrollAndSettle();
        expect(result.current).toBe(1);

        setArticleRect(300, 2800);
        scrollAndSettle();
        expect(result.current).toBe(0);
    });

    it('throttles scroll updates to one per animation frame', () => {
        const { result } = renderHook(() => useReadingProgress());

        act(() => {
            setArticleRect(-500, 2800);
            window.dispatchEvent(new Event('scroll'));
            setArticleRect(-1000, 2800);
            window.dispatchEvent(new Event('scroll'));
        });
        expect(result.current).toBe(0);

        act(() => {
            vi.advanceTimersByTime(16);
        });
        // Measured once, in the frame, with the latest position.
        expect(result.current).toBe(0.5);
    });

    it('recomputes on resize', () => {
        const { result } = renderHook(() => useReadingProgress());

        setArticleRect(-1000, 2800);
        act(() => {
            window.dispatchEvent(new Event('resize'));
            vi.advanceTimersByTime(16);
        });

        expect(result.current).toBe(0.5);
    });

    it('treats an article shorter than the viewport as done once its top passes', () => {
        setArticleRect(10, 400);
        const { result } = renderHook(() => useReadingProgress());
        expect(result.current).toBe(0);

        setArticleRect(0, 400);
        scrollAndSettle();
        expect(result.current).toBe(1);
    });

    it('stops listening once unmounted', () => {
        const { result, unmount } = renderHook(() => useReadingProgress());
        unmount();

        setArticleRect(-1000, 2800);
        scrollAndSettle();

        expect(result.current).toBe(0);
    });
});
