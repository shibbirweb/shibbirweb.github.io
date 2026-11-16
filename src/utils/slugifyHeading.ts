/**
 * Turn heading text into a URL-safe anchor slug (`Cache-aside` -> `cache-aside`).
 *
 * Kept free of the Markdown pipeline's server-only imports, so the client-side
 * article editor can derive slugs without bundling `@/lib/markdown`.
 */
export function slugifyHeading(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
