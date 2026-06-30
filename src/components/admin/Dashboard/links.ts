/** The editor route for a given article handle. */
export function editorHref(id: string): string {
    return `/admin/articles/editor?id=${encodeURIComponent(id)}`;
}
