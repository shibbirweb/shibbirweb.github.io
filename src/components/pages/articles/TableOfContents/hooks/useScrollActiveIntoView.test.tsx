import { render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollActiveIntoView } from '@/components/pages/articles/TableOfContents/hooks/useScrollActiveIntoView';

const CONTAINER_TOP = 100;
const CONTAINER_BOTTOM = 400;

function rect(top: number, bottom: number): DOMRect {
    return {
        top,
        bottom,
        left: 0,
        right: 0,
        width: 0,
        height: bottom - top,
    } as DOMRect;
}

function Nav({
    activeId,
    itemTops,
}: {
    activeId: string | null;
    itemTops: number[];
}) {
    const navRef = useRef<HTMLElement>(null);
    useScrollActiveIntoView(navRef, activeId);

    return (
        <nav
            ref={navRef}
            data-testid="toc"
        >
            {itemTops.map((top, index) => (
                <a
                    key={top}
                    href={`#heading-${index}`}
                    data-top={top}
                    aria-current={
                        `heading-${index}` === activeId ? 'location' : undefined
                    }
                >
                    Heading {index}
                </a>
            ))}
        </nav>
    );
}

const scrollTo = vi.fn();
const originalScrollTo = Element.prototype.scrollTo;

beforeEach(() => {
    scrollTo.mockReset();
    Element.prototype.scrollTo = scrollTo;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        function (this: Element) {
            if (this.tagName === 'NAV') {
                return rect(CONTAINER_TOP, CONTAINER_BOTTOM);
            }
            const top = Number((this as HTMLElement).dataset.top ?? 0);
            return rect(top, top + 20);
        }
    );
});

afterEach(() => {
    vi.restoreAllMocks();
    Element.prototype.scrollTo = originalScrollTo;
});

describe('useScrollActiveIntoView', () => {
    it('does nothing without an active heading', () => {
        render(
            <Nav
                activeId={null}
                itemTops={[110, 200]}
            />
        );

        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('leaves the container alone while the active item is visible', () => {
        render(
            <Nav
                activeId="heading-1"
                itemTops={[110, 200]}
            />
        );

        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('scrolls the container down to reveal an item below the fold', () => {
        render(
            <Nav
                activeId="heading-1"
                itemTops={[110, 500]}
            />
        );

        // Item bottom 520 is past the container bottom 400 (less 16px padding).
        expect(scrollTo).toHaveBeenCalledWith({
            top: 520 - CONTAINER_BOTTOM + 16,
            behavior: 'smooth',
        });
    });

    it('scrolls the container up to reveal an item above the top', () => {
        render(
            <Nav
                activeId="heading-1"
                itemTops={[110, 50]}
            />
        );

        expect(scrollTo).toHaveBeenCalledWith({
            top: 50 - CONTAINER_TOP - 16,
            behavior: 'smooth',
        });
    });

    it('scrolls fully to the top when the first item becomes active', () => {
        const { getByTestId, rerender } = render(
            <Nav
                activeId={null}
                itemTops={[110, 200]}
            />
        );
        getByTestId('toc').scrollTop = 80;

        rerender(
            <Nav
                activeId="heading-0"
                itemTops={[110, 200]}
            />
        );

        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('jumps without smoothing under reduced motion', () => {
        vi.spyOn(window, 'matchMedia').mockReturnValue({
            matches: true,
        } as MediaQueryList);

        render(
            <Nav
                activeId="heading-1"
                itemTops={[110, 500]}
            />
        );

        expect(scrollTo).toHaveBeenCalledWith(
            expect.objectContaining({ behavior: 'auto' })
        );
    });

    it('scrolls only the container, never the window', () => {
        const windowScroll = vi.spyOn(window, 'scrollTo');

        render(
            <Nav
                activeId="heading-1"
                itemTops={[110, 500]}
            />
        );

        expect(windowScroll).not.toHaveBeenCalled();
        expect(scrollTo.mock.contexts[0]).toBeInstanceOf(HTMLElement);
        expect((scrollTo.mock.contexts[0] as HTMLElement).tagName).toBe('NAV');
    });
});
