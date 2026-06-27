/** Format an ISO date (YYYY-MM-DD) as a short, human-readable label. */
export function formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
