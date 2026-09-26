import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Pagination from '@/components/pages/articles/Pagination';

const createHref = (page: number) => `/articles?page=${page}`;

function renderPagination(current: number, total: number) {
    return render(
        <Pagination
            current={current}
            total={total}
            createHref={createHref}
        />
    );
}

/** The visible page numbers and ellipsis markers, in order. */
function pageItems(): string[] {
    const nav = screen.getByRole('navigation', { name: 'Article pages' });
    return Array.from(nav.children)
        .map((element) => element.textContent ?? '')
        .filter((text) => text !== 'Prev' && text !== 'Next');
}

describe('Pagination', () => {
    it('renders nothing when there is only one page', () => {
        const { container } = renderPagination(1, 1);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when there are no pages', () => {
        const { container } = renderPagination(1, 0);

        expect(container).toBeEmptyDOMElement();
    });

    it('hides Prev on the first page and links Next to page 2', () => {
        renderPagination(1, 3);

        expect(
            screen.queryByRole('link', { name: 'Prev' })
        ).not.toBeInTheDocument();
        const next = screen.getByRole('link', { name: 'Next' });
        expect(next).toHaveAttribute('href', '/articles?page=2');
        expect(next).toHaveAttribute('rel', 'next');
    });

    it('hides Next on the last page and links Prev to the page before', () => {
        renderPagination(3, 3);

        expect(
            screen.queryByRole('link', { name: 'Next' })
        ).not.toBeInTheDocument();
        const previous = screen.getByRole('link', { name: 'Prev' });
        expect(previous).toHaveAttribute('href', '/articles?page=2');
        expect(previous).toHaveAttribute('rel', 'prev');
    });

    it('marks only the current page with aria-current', () => {
        renderPagination(2, 3);

        expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
            'aria-current',
            'page'
        );
        expect(screen.getByRole('link', { name: '1' })).not.toHaveAttribute(
            'aria-current'
        );
        expect(screen.getByRole('link', { name: '3' })).not.toHaveAttribute(
            'aria-current'
        );
    });

    it('lists every page number when there are seven or fewer pages', () => {
        renderPagination(4, 7);

        expect(pageItems()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
    });

    it('collapses the tail into an ellipsis near the start past seven pages', () => {
        renderPagination(1, 10);

        expect(pageItems()).toEqual(['1', '2', '…', '10']);
    });

    it('collapses both sides around a middle page', () => {
        renderPagination(5, 10);

        expect(pageItems()).toEqual(['1', '…', '4', '5', '6', '…', '10']);
    });

    it('collapses the head into an ellipsis near the end', () => {
        renderPagination(10, 10);

        expect(pageItems()).toEqual(['1', '…', '9', '10']);
    });

    it('hides the ellipsis from assistive tech', () => {
        renderPagination(5, 10);

        const nav = screen.getByRole('navigation', { name: 'Article pages' });
        const ellipses = within(nav).getAllByText('…');
        expect(ellipses).toHaveLength(2);
        for (const ellipsis of ellipses) {
            expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
        }
    });

    it('builds each page link through createHref', () => {
        renderPagination(1, 3);

        expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
            'href',
            '/articles?page=3'
        );
    });
});
