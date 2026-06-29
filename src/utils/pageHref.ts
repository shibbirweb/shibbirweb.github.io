import type { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Builds a pagination href that keeps the current query params (e.g. `tag`, `q`)
 * intact while moving to `page`. Page 1 drops the `page` param so the first page
 * keeps its canonical, param-free URL.
 */
export function buildPageHref(
    pathname: string,
    params: URLSearchParams | ReadonlyURLSearchParams,
    page: number
): string {
    const next = new URLSearchParams(params.toString());
    if (page <= 1) next.delete('page');
    else next.set('page', String(page));
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
}
